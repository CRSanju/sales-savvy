# sales-savvy — Password Reset Feature

This zip contains all the NEW and MODIFIED files to add password reset
(forgot password via email) to your jwtDemo Spring Boot project.

---

## Files included

### NEW files — copy these into your project:

| File | Destination |
|------|-------------|
| entity/PasswordResetToken.java | src/main/java/com/example/jwtDemo/entity/ |
| repository/PasswordResetTokenRepository.java | src/main/java/com/example/jwtDemo/repository/ |
| service/PasswordResetService.java | src/main/java/com/example/jwtDemo/service/ |
| controller/PasswordResetController.java | src/main/java/com/example/jwtDemo/controller/ |
| dto/ForgotPasswordRequest.java | src/main/java/com/example/jwtDemo/dto/ |
| dto/ResetPasswordRequest.java | src/main/java/com/example/jwtDemo/dto/ |
| static/forgot-password.html | src/main/resources/static/ |
| static/reset-password.html | src/main/resources/static/ |

### MODIFIED files — replace the originals in your project:

| File | What changed |
|------|--------------|
| entity/User.java | Added `email` field |
| repository/UserRepository.java | Added `findByEmail()` method |
| dto/RegisterRequest.java | Added `email` field |
| service/AuthService.java | Sets email on register |
| config/SecurityConfig.java | Permits forgot-password.html and reset-password.html |
| resources/application.properties | Added mail config block |

---

## Setup steps

1. Add this dependency to your pom.xml inside <dependencies>:

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>

2. In application.properties, fill in your real Gmail and App Password:

    spring.mail.username=your-email@gmail.com
    spring.mail.password=your-16-char-app-password

   To get an App Password:
   Google Account → Security → 2-Step Verification → App Passwords
   Generate one for "Mail" and paste the 16-character code.

3. Restart the app. Hibernate will auto-create the password_reset_tokens
   table and add the email column to users (ddl-auto=update handles this).

4. Add a "Forgot Password?" link on your login.html pointing to /forgot-password.html

---

## How the flow works

1. User clicks "Forgot Password?" on login page
2. Enters their registered email on /forgot-password.html
3. Backend generates a secure UUID token, saves it with 15-min expiry, sends email
4. User clicks the link in the email → lands on /reset-password.html?token=...
5. User enters new password → backend validates token, updates password, marks token used
6. User is redirected to login page
