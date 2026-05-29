package com.dariusfirstproject.gura_neza.email;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import com.dariusfirstproject.gura_neza.order.OrderResponse;
import org.thymeleaf.context.Context;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    public void sendVerificationEmail(String to, String name, String verificationLink) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("verificationLink", verificationLink);

            String html = templateEngine.process("verification-email", context);

            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setFrom("noreply@guraneza.com");
            helper.setSubject("Verify your Gura Neza account");
            helper.setText(html, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }
    }
    public void sendOrderConfirmationEmail(String to, String name, OrderResponse order) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("orderId", order.getId());
            context.setVariable("items", order.getItems());
            context.setVariable("totalPrice", order.getTotalPrice());
            context.setVariable("createdAt", order.getCreatedAt());

            String html = templateEngine.process("order-confirmation-email", context);

            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setFrom("noreply@guraneza.com");
            helper.setSubject("Order Confirmation #" + order.getId());
            helper.setText(html, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send order confirmation email: " + e.getMessage());
        }
    }
}