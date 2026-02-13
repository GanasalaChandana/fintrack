package com.fintrack.reports_service.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class PdfGeneratorService {

    // Fonts & Colors
    private static final BaseColor BRAND_BLUE = new BaseColor(59, 130, 246);
    private static final BaseColor LIGHT_GRAY = new BaseColor(243, 244, 246);
    private static final BaseColor DARK_GRAY = new BaseColor(55, 65, 81);
    private static final BaseColor SUCCESS_GREEN = new BaseColor(16, 185, 129);
    private static final BaseColor DANGER_RED = new BaseColor(239, 68, 68);

    /**
     * Generate a complete financial report PDF and return it as bytes.
     */
    public byte[] generateFinancialReport(Map<String, Object> reportData, String range) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Document document = new Document(PageSize.A4, 50, 50, 60, 60);
            PdfWriter writer = PdfWriter.getInstance(document, baos);

            // Page header/footer via page events
            writer.setPageEvent(new HeaderFooterEvent(range));

            document.open();

            addCoverSection(document, range);
            addSummarySection(document, reportData);
            addCategorySection(document, reportData);
            addTopExpensesSection(document, reportData);
            addInsightsSection(document, reportData);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    // -----------------------------------------------------------------------
    // Cover / Title
    // -----------------------------------------------------------------------

    private void addCoverSection(Document doc, String range) throws DocumentException {
        // Blue header bar
        PdfPTable header = new PdfPTable(1);
        header.setWidthPercentage(100);

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(BRAND_BLUE);
        cell.setPadding(20);
        cell.setBorder(Rectangle.NO_BORDER);

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.WHITE);
        Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.WHITE);

        Paragraph title = new Paragraph("FinTrack Financial Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        Paragraph sub = new Paragraph(
                "Period: " + formatRange(range) + "  |  Generated: "
                        + LocalDate.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                subFont);
        sub.setAlignment(Element.ALIGN_CENTER);

        cell.addElement(title);
        cell.addElement(sub);
        header.addCell(cell);
        doc.add(header);
        doc.add(Chunk.NEWLINE);
    }

    // -----------------------------------------------------------------------
    // Financial Summary
    // -----------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private void addSummarySection(Document doc, Map<String, Object> data) throws DocumentException {
        doc.add(sectionTitle("Financial Summary"));

        Map<String, Object> summary = (Map<String, Object>) data.getOrDefault("summary", Map.of());

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setSpacingBefore(8);

        addSummaryCard(table, "Net Income", summary.get("netIncome"), SUCCESS_GREEN);
        addSummaryCard(table, "Total Expenses", summary.get("totalExpenses"), DANGER_RED);
        addSummaryCard(table, "Net Savings", summary.get("netSavings"), BRAND_BLUE);
        addSummaryCard(table, "Savings Rate", summary.get("savingsRate"), DARK_GRAY);

        doc.add(table);
        doc.add(Chunk.NEWLINE);
    }

    private void addSummaryCard(PdfPTable table, String label, Object value, BaseColor accent) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(LIGHT_GRAY);
        cell.setBorderColor(accent);
        cell.setBorderWidth(2);
        cell.setPadding(12);

        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA, 9, DARK_GRAY);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, accent);

        cell.addElement(new Paragraph(label, labelFont));
        cell.addElement(new Paragraph(formatValue(label, value), valueFont));
        table.addCell(cell);
    }

    private String formatValue(String label, Object val) {
        if (val == null)
            return "N/A";
        if (label.contains("Rate"))
            return String.format("%.1f%%", toDouble(val));
        return String.format("$%.2f", toDouble(val));
    }

    // -----------------------------------------------------------------------
    // Category Breakdown
    // -----------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private void addCategorySection(Document doc, Map<String, Object> data) throws DocumentException {
        doc.add(sectionTitle("Spending by Category"));

        List<Map<String, Object>> categories = (List<Map<String, Object>>) data.getOrDefault("categoryBreakdown",
                List.of());

        if (categories.isEmpty()) {
            doc.add(noDataParagraph());
            return;
        }

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 3, 2, 2, 1.5f });
        table.setSpacingBefore(8);

        // Header row
        for (String h : new String[] { "Category", "Amount", "Budget", "% Used" }) {
            PdfPCell hCell = new PdfPCell(new Phrase(h,
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE)));
            hCell.setBackgroundColor(BRAND_BLUE);
            hCell.setPadding(8);
            hCell.setBorder(Rectangle.NO_BORDER);
            table.addCell(hCell);
        }

        // Data rows
        boolean alternate = false;
        for (Map<String, Object> cat : categories) {
            BaseColor rowBg = alternate ? LIGHT_GRAY : BaseColor.WHITE;
            double amount = toDouble(cat.get("amount"));
            double budget = toDouble(cat.get("budget"));
            boolean over = amount > budget;

            addTableCell(table, String.valueOf(cat.getOrDefault("name", "")), rowBg, BaseColor.BLACK, false);
            addTableCell(table, String.format("$%.2f", amount), rowBg, BaseColor.BLACK, false);
            addTableCell(table, String.format("$%.2f", budget), rowBg, BaseColor.BLACK, false);
            addTableCell(table, String.format("%.0f%%", toDouble(cat.get("percentage"))),
                    rowBg, over ? DANGER_RED : SUCCESS_GREEN, true);

            alternate = !alternate;
        }

        doc.add(table);
        doc.add(Chunk.NEWLINE);
    }

    // -----------------------------------------------------------------------
    // Top Expenses
    // -----------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private void addTopExpensesSection(Document doc, Map<String, Object> data) throws DocumentException {
        doc.add(sectionTitle("Top Expenses"));

        List<Map<String, Object>> expenses = (List<Map<String, Object>>) data.getOrDefault("topExpenses", List.of());

        if (expenses.isEmpty()) {
            doc.add(noDataParagraph());
            return;
        }

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[] { 3, 2, 1.5f, 2 });
        table.setSpacingBefore(8);

        for (String h : new String[] { "Vendor", "Category", "Frequency", "Amount" }) {
            PdfPCell hCell = new PdfPCell(new Phrase(h,
                    FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, BaseColor.WHITE)));
            hCell.setBackgroundColor(DARK_GRAY);
            hCell.setPadding(8);
            hCell.setBorder(Rectangle.NO_BORDER);
            table.addCell(hCell);
        }

        boolean alternate = false;
        for (Map<String, Object> exp : expenses) {
            BaseColor rowBg = alternate ? LIGHT_GRAY : BaseColor.WHITE;
            addTableCell(table, String.valueOf(exp.getOrDefault("vendor", "")), rowBg, BaseColor.BLACK, false);
            addTableCell(table, String.valueOf(exp.getOrDefault("category", "")), rowBg, BaseColor.BLACK, false);
            addTableCell(table, String.valueOf(exp.getOrDefault("frequency", "")), rowBg, BaseColor.BLACK, false);
            addTableCell(table, String.format("$%.2f", toDouble(exp.get("amount"))), rowBg, DANGER_RED, true);
            alternate = !alternate;
        }

        doc.add(table);
        doc.add(Chunk.NEWLINE);
    }

    // -----------------------------------------------------------------------
    // Insights
    // -----------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private void addInsightsSection(Document doc, Map<String, Object> data) throws DocumentException {
        doc.add(sectionTitle("Key Insights"));

        List<String> insights = (List<String>) data.getOrDefault("insights", List.of());

        if (insights.isEmpty()) {
            doc.add(noDataParagraph());
            return;
        }

        Font insightFont = FontFactory.getFont(FontFactory.HELVETICA, 10, DARK_GRAY);
        for (String insight : insights) {
            Paragraph p = new Paragraph("• " + insight, insightFont);
            p.setIndentationLeft(10);
            p.setSpacingBefore(4);
            doc.add(p);
        }
    }

    // -----------------------------------------------------------------------
    // Shared helpers
    // -----------------------------------------------------------------------

    private Paragraph sectionTitle(String text) {
        Font f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BRAND_BLUE);
        Paragraph p = new Paragraph(text, f);
        p.setSpacingBefore(16);
        p.setSpacingAfter(4);
        return p;
    }

    private Paragraph noDataParagraph() {
        Font f = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY);
        return new Paragraph("No data available for this period.", f);
    }

    private void addTableCell(PdfPTable table, String text,
            BaseColor bg, BaseColor textColor, boolean bold) {
        Font f = bold
                ? FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, textColor)
                : FontFactory.getFont(FontFactory.HELVETICA, 9, textColor);
        PdfPCell cell = new PdfPCell(new Phrase(text, f));
        cell.setBackgroundColor(bg);
        cell.setPadding(7);
        cell.setBorderColor(new BaseColor(229, 231, 235));
        table.addCell(cell);
    }

    private double toDouble(Object val) {
        if (val == null)
            return 0.0;
        if (val instanceof Number)
            return ((Number) val).doubleValue();
        try {
            return Double.parseDouble(val.toString());
        } catch (Exception e) {
            return 0.0;
        }
    }

    private String formatRange(String range) {
        return switch (range) {
            case "last-7-days" -> "Last 7 Days";
            case "last-30-days" -> "Last 30 Days";
            case "last-3-months" -> "Last 3 Months";
            case "last-6-months" -> "Last 6 Months";
            case "last-year" -> "Last Year";
            default -> range;
        };
    }

    // -----------------------------------------------------------------------
    // Page Header / Footer
    // -----------------------------------------------------------------------

    private static class HeaderFooterEvent extends PdfPageEventHelper {
        private final String range;

        HeaderFooterEvent(String range) {
            this.range = range;
        }

        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            Font font = FontFactory.getFont(FontFactory.HELVETICA, 8, BaseColor.GRAY);

            // Footer left: brand
            ColumnText.showTextAligned(cb, Element.ALIGN_LEFT,
                    new Phrase("FinTrack — Confidential", font),
                    document.left(), document.bottom() - 15, 0);

            // Footer right: page number
            ColumnText.showTextAligned(cb, Element.ALIGN_RIGHT,
                    new Phrase("Page " + writer.getPageNumber(), font),
                    document.right(), document.bottom() - 15, 0);
        }
    }
}