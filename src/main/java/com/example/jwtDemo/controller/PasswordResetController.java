package com.example.jwtDemo.controller;

import com.example.jwtDemo.dto.ForgotPasswordRequest;
import com.example.jwtDemo.dto.ResetPasswordRequest;
import com.example.jwtDemo.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    public PasswordResetController(PasswordResetService passwordResetService) {
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        passwordResetService.sendResetLink(request.email());
        // Always return a generic success — never reveal whether the email exists
        return ResponseEntity.ok(Map.of("message",
                "If an account with that email exists, a reset link has been sent"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request.token(), request.newPassword());
        return ResponseEntity.ok(Map.of("message",
                "Password reset successfully. You can now log in"));
    }
}
