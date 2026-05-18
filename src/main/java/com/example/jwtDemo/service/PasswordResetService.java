package com.example.jwtDemo.service;

import com.example.jwtDemo.entity.PasswordResetToken;
import com.example.jwtDemo.entity.User;
import com.example.jwtDemo.repository.PasswordResetTokenRepository;
import com.example.jwtDemo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.base-url}")
    private String baseUrl;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public PasswordResetService(UserRepository userRepository,
                                PasswordResetTokenRepository tokenRepository,
                                JavaMailSender mailSender,
                                PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.mailSender = mailSender;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void sendResetLink(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email"));

        // Delete any existing tokens for this user before creating a new one
        tokenRepository.deleteAllByUserId(user.getId());

        // Generate a secure random token
        String token = UUID.randomUUID().toString();

        // Save token with 15-minute expiry
        PasswordResetToken resetToken = new PasswordResetToken(
                token,
                user,
                LocalDateTime.now().plusMinutes(15)
        );
        tokenRepository.save(resetToken);

        // Build and send the email
        String resetLink = baseUrl + "/reset-password.html?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(email);
        message.setSubject("Password Reset Request");
        message.setText(
            "Hi " + user.getName() + ",\n\n" +
            "You requested to reset your password. Click the link below:\n\n" +
            resetLink + "\n\n" +
            "This link expires in 15 minutes.\n\n" +
            "If you didn't request this, you can safely ignore this email.\n\n" +
            "Regards,\nJWT Shop Team"
        );
        mailSender.send(message);
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

        // Mark token as used so it cannot be reused
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }
}
