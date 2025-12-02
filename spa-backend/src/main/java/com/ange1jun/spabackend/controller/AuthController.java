package com.ange1jun.spabackend.controller;


import com.ange1jun.spabackend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtTokenProvider jwtTokenProvider;
    // private final UserRepository userRepository; // 실제 DB 조회 시 필요
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String password = request.get("password");

        // [실제 로직] DB에서 사용자 조회 및 비밀번호 검증
        // User user = userRepository.findByUserId(userId).orElseThrow(() -> new IllegalArgumentException("가입되지 않은 ID"));
        // if (!passwordEncoder.matches(password, user.getPassword())) { ... }

        // [테스트용 더미 로직] admin / 1234 일 경우 성공
        if ("admin".equals(userId) && "1234".equals(password)) {
            String token = jwtTokenProvider.createToken(userId);
            return ResponseEntity.ok().body(Map.of("token", token, "message", "로그인 성공"));
        } else {
            return ResponseEntity.status(401).body("서버에 존재하지 않는 계정입니다.");
        }
    }
}
