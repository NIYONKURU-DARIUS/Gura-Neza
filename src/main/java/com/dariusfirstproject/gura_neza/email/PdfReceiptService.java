package com.dariusfirstproject.gura_neza.email;

import com.dariusfirstproject.gura_neza.order.OrderResponse;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PdfReceiptService {

    private static final DeviceRgb GREEN = new DeviceRgb(46, 125, 50);
    private static final DeviceRgb LIGHT_GREEN = new DeviceRgb(241, 248, 233);
    private static final DeviceRgb DARK_GRAY = new DeviceRgb(66, 66, 66);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(245, 245, 245);
    private static final DeviceRgb WHITE = new DeviceRgb(255, 255, 255);

    public byte[] generateReceipt(OrderResponse order, String customerName) {
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            document.setMargins(40, 50, 40, 50);

            // ── HEADER ──────────────────────────────────────
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth();
            headerTable.setBorder(Border.NO_BORDER);

            Cell brandCell = new Cell().setBorder(Border.NO_BORDER);
            brandCell.add(new Paragraph("GURA NEZA")
                    .setBold()
                    .setFontSize(26)
                    .setFontColor(GREEN));
            brandCell.add(new Paragraph("Your Trusted Marketplace")
                    .setFontSize(10)
                    .setFontColor(DARK_GRAY));
            headerTable.addCell(brandCell);

            Cell receiptLabelCell = new Cell()
                    .setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT);
            receiptLabelCell.add(new Paragraph("RECEIPT")
                    .setBold()
                    .setFontSize(20)
                    .setFontColor(DARK_GRAY));
            receiptLabelCell.add(new Paragraph("Order #" + order.getId())
                    .setFontSize(11)
                    .setFontColor(DARK_GRAY));
            headerTable.addCell(receiptLabelCell);

            document.add(headerTable);

            // ── DIVIDER ──────────────────────────────────────
            document.add(new Paragraph(" ")
                    .setBorderBottom(new SolidBorder(GREEN, 2))
                    .setMarginBottom(10));

            // ── ORDER INFO BOX ──────────────────────────────
            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth()
                    .setBackgroundColor(LIGHT_GREEN)
                    .setMarginTop(10)
                    .setMarginBottom(20)
                    .setPadding(10);

            Cell customerCell = new Cell().setBorder(Border.NO_BORDER).setPadding(8);
            customerCell.add(new Paragraph("BILLED TO").setBold().setFontSize(9).setFontColor(GREEN));
            customerCell.add(new Paragraph(customerName).setBold().setFontSize(12).setFontColor(DARK_GRAY));

            Cell dateCell = new Cell().setBorder(Border.NO_BORDER).setPadding(8)
                    .setTextAlignment(TextAlignment.RIGHT);
            dateCell.add(new Paragraph("DATE").setBold().setFontSize(9).setFontColor(GREEN));
            dateCell.add(new Paragraph(order.getCreatedAt().toString()).setFontSize(10).setFontColor(DARK_GRAY));

            Cell statusCell = new Cell().setBorder(Border.NO_BORDER).setPadding(8);
            statusCell.add(new Paragraph("STATUS").setBold().setFontSize(9).setFontColor(GREEN));
            statusCell.add(new Paragraph(order.getStatus().toString()).setFontSize(10).setFontColor(DARK_GRAY));

            infoTable.addCell(customerCell);
            infoTable.addCell(dateCell);
            document.add(infoTable);

            // ── ITEMS TABLE ──────────────────────────────────
            Table table = new Table(UnitValue.createPercentArray(new float[]{5, 2, 2, 2}))
                    .useAllAvailableWidth()
                    .setMarginTop(10);

            // Table header
            String[] headers = {"PRODUCT", "QTY", "UNIT PRICE", "SUBTOTAL"};
            for (String h : headers) {
                table.addHeaderCell(new Cell()
                        .setBackgroundColor(GREEN)
                        .setPadding(8)
                        .setBorder(Border.NO_BORDER)
                        .add(new Paragraph(h)
                                .setBold()
                                .setFontSize(10)
                                .setFontColor(WHITE)));
            }

            // Table rows
            boolean alternate = false;
            for (var item : order.getItems()) {
                DeviceRgb rowColor = alternate ? LIGHT_GRAY : WHITE;
                alternate = !alternate;

                table.addCell(new Cell().setBackgroundColor(rowColor).setPadding(8)
                        .setBorder(Border.NO_BORDER)
                        .add(new Paragraph(item.getProductName()).setFontSize(10).setFontColor(DARK_GRAY)));
                table.addCell(new Cell().setBackgroundColor(rowColor).setPadding(8)
                        .setBorder(Border.NO_BORDER)
                        .setTextAlignment(TextAlignment.CENTER)
                        .add(new Paragraph(String.valueOf(item.getQuantity())).setFontSize(10).setFontColor(DARK_GRAY)));
                table.addCell(new Cell().setBackgroundColor(rowColor).setPadding(8)
                        .setBorder(Border.NO_BORDER)
                        .setTextAlignment(TextAlignment.RIGHT)
                        .add(new Paragraph(item.getPrice() + " RWF").setFontSize(10).setFontColor(DARK_GRAY)));
                table.addCell(new Cell().setBackgroundColor(rowColor).setPadding(8)
                        .setBorder(Border.NO_BORDER)
                        .setTextAlignment(TextAlignment.RIGHT)
                        .add(new Paragraph(item.getSubtotal() + " RWF").setFontSize(10).setFontColor(DARK_GRAY)));
            }

            document.add(table);

            // ── TOTAL ────────────────────────────────────────
            Table totalTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth()
                    .setMarginTop(5);

            totalTable.addCell(new Cell().setBorder(Border.NO_BORDER));
            totalTable.addCell(new Cell()
                    .setBackgroundColor(GREEN)
                    .setPadding(10)
                    .setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT)
                    .add(new Paragraph("TOTAL:   " + order.getTotalPrice() + " RWF")
                            .setBold()
                            .setFontSize(14)
                            .setFontColor(WHITE)));

            document.add(totalTable);

            // ── FOOTER ───────────────────────────────────────
            document.add(new Paragraph(" ").setMarginTop(30));
            document.add(new Paragraph("Thank you for shopping with Gura Neza!")
                    .setItalic()
                    .setFontSize(11)
                    .setFontColor(GREEN)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("This is an automatically generated receipt. Please keep it for your records.")
                    .setFontSize(8)
                    .setFontColor(DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
            return outputStream.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF receipt: " + e.getMessage());
        }
    }
}