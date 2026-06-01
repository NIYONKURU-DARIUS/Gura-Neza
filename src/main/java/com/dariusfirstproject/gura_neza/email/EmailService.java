package com.dariusfirstproject.gura_neza.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import com.dariusfirstproject.gura_neza.order.OrderResponse;
import org.thymeleaf.context.Context;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final PdfReceiptService pdfReceiptService;

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
            log.warn("Could not send verification email to {}: {}", to, e.getMessage());
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

            // Attach PDF receipt
            byte[] pdfBytes = pdfReceiptService.generateReceipt(order, name);
            helper.addAttachment("receipt-order-" + order.getId() + ".pdf",
                    new org.springframework.core.io.ByteArrayResource(pdfBytes));

            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Could not send order confirmation email to {}: {}", to, e.getMessage());
        }
    }
    // ✅ NEW — Wallet top-up notification
    public void sendWalletTopUpEmail(String to, String name, BigDecimal amount, BigDecimal newBalance) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("amount", amount);
            context.setVariable("newBalance", newBalance);

            String html = templateEngine.process("wallet-topup-email", context);

            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setFrom("noreply@guraneza.com");
            helper.setSubject("Your Gura Neza wallet has been topped up");
            helper.setText(html, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send wallet top-up email: " + e.getMessage());
        }
    }

    // ✅ NEW — Order cancellation notification
    public void sendOrderCancellationEmail(String to, String name, Long orderId, BigDecimal totalPrice) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("orderId", orderId);
            context.setVariable("totalPrice", totalPrice);

            String html = templateEngine.process("order-cancellation-email", context);

            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setFrom("noreply@guraneza.com");
            helper.setSubject("Your order #" + orderId + " has been cancelled");
            helper.setText(html, true);

            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send cancellation email: " + e.getMessage());
        }
    }

    // ✅ NEW — Order delivery confirmation with PDF receipt
    public void sendOrderDeliveryEmail(String to, String name, OrderResponse order) {
        try {
            Context context = new Context();
            context.setVariable("name", name);
            context.setVariable("orderId", order.getId());
            context.setVariable("items", order.getItems());
            context.setVariable("totalPrice", order.getTotalPrice());
            context.setVariable("createdAt", order.getCreatedAt());

            String html = templateEngine.process("order-delivery-email", context);

            var message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setFrom("noreply@guraneza.com");
            helper.setSubject("Your order #" + order.getId() + " has been delivered!");
            helper.setText(html, true);

            // Attach PDF receipt
            byte[] pdfBytes = pdfReceiptService.generateReceipt(order, name);
            helper.addAttachment("receipt-order-" + order.getId() + ".pdf",
                    new org.springframework.core.io.ByteArrayResource(pdfBytes));

            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Could not send delivery email to {}: {}", to, e.getMessage());
        }
    }
}