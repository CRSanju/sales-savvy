package com.example.jwtDemo.service;

import com.example.jwtDemo.entity.PasswordResetToken;
import com.example.jwtDemo.entity.User;
import com.example.jwtDemo.repository.PasswordResetTokenRepository;
import com.example.jwtDemo.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    private final WebClient webClient;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;

        this.webClient = WebClient.builder()
                .baseUrl("https://api.brevo.com/v3/smtp/email")
                .build();
    }

    @Transactional
    public void sendResetLink(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email"));

        tokenRepository.deleteAllByUserId(user.getId());

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken(
                token,
                user,
                LocalDateTime.now().plusMinutes(15)
        );

        tokenRepository.save(resetToken);

        String resetLink = baseUrl + "/reset-password.html?token=" + token;

        String emailContent =
                "Hi " + user.getName() + ",<br><br>" +
                "You requested to reset your password.<br><br>" +
                "<a href=\"" + resetLink + "\">Reset Password</a><br><br>" +
                "This link expires in 15 minutes.<br><br>" +
                "If you didn't request this, you can ignore this email.<br><br>" +
                "Regards,<br>Sales Savvy Team";

        Map<String, Object> body = Map.of(
                "sender", Map.of(
                        "name", "Sales Savvy",
                        "email", "rsanju.3312@gmail.com"
                ),
                "to", new Object[]{
                        Map.of("email", email)
                },
                "subject", "Password Reset Request",
                "htmlContent", emailContent
        );

        webClient.post()
                .header("api-key", brevoApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class)
                .block();
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {

        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (resetToken.isUsed()) {
            throw new RuntimeException("This reset link has already been used");
        }

        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset link has expired. Please request a new one");
        }

        User user = resetToken.getUser();

        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        resetToken.setUsed(true);

        tokenRepository.save(resetToken);
    }
}
