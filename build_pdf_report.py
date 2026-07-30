import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
)
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Register Cyrillic Font
FONT_REG = 'NotoSans'
FONT_BOLD = 'NotoSans-Bold'

font_dir = '/usr/share/fonts/google-noto'
pdfmetrics.registerFont(TTFont(FONT_REG, os.path.join(font_dir, 'NotoSans-Regular.ttf')))
pdfmetrics.registerFont(TTFont(FONT_BOLD, os.path.join(font_dir, 'NotoSans-Bold.ttf')))

# Generate Chart 1: Category Distribution
def generate_chart1():
    fig, ax = plt.subplots(figsize=(6, 2.6), dpi=200)
    categories = ['Expat & Living', 'AI & ML', 'Finance & Crypto', 'SaaS & Pricing', 'Tech Jobs & Legal']
    counts = [4, 3, 2, 2, 2]
    colors_list = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6']
    
    bars = ax.barh(categories, counts, color=colors_list, height=0.55)
    ax.set_title('Розподіл датасетів x402 Data Hub за категоріями', fontsize=11, fontweight='bold', pad=10, color='#1e293b')
    ax.set_xlabel('Кількість API-ендпоінтів', fontsize=9, color='#475569')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#cbd5e1')
    ax.spines['bottom'].set_color('#cbd5e1')
    ax.grid(axis='x', linestyle='--', alpha=0.5)
    
    for bar in bars:
        width = bar.get_width()
        ax.text(width + 0.1, bar.get_y() + bar.get_height()/2, f'{int(width)}',
                va='center', ha='left', fontsize=9, fontweight='bold', color='#1e293b')
                
    plt.tight_layout()
    chart_path = '/tmp/chart_categories.png'
    plt.savefig(chart_path, format='png', transparent=True)
    plt.close()
    return chart_path

# Generate Chart 2: Cost Comparison
def generate_chart2():
    fig, ax = plt.subplots(figsize=(6, 2.6), dpi=200)
    queries = [10, 50, 100, 500, 1000]
    traditional_sub = [49] * len(queries)
    x402_cost = [q * 0.01 for q in queries]
    
    ax.plot(queries, traditional_sub, label='Традиційна підписка SaaS ($49/міс)', color='#ef4444', linewidth=2.5, linestyle='--')
    ax.plot(queries, x402_cost, label='x402 Pay-per-Request ($0.01/запит)', color='#10b981', linewidth=2.5, marker='o')
    
    ax.set_title('Економія для розробників AI-агентів ($0.01/запит vs Подписка)', fontsize=11, fontweight='bold', pad=10)
    ax.set_xlabel('Кількість запитів на місяць', fontsize=9)
    ax.set_ylabel('Вартість (USD)', fontsize=9)
    ax.legend(loc='upper left', fontsize=8.5)
    ax.grid(True, linestyle=':', alpha=0.6)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    plt.tight_layout()
    chart_path = '/tmp/chart_cost.png'
    plt.savefig(chart_path, format='png', transparent=True)
    plt.close()
    return chart_path

chart1_path = generate_chart1()
chart2_path = generate_chart2()

# Page Numbering Canvas
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont(FONT_REG, 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 11 * 72 - 36, "x402 Data Hub — Звіт про розробку та архітектуру")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)
            
        # Footer
        text = f"Сторінка {self._pageNumber} з {page_count}"
        self.drawRightString(8.5 * 72 - 54, 36, text)
        self.drawString(54, 36, "https://x402datahub.io | Конфіденційно")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 8.5 * 72 - 54, 48)
        
        self.restoreState()

# Build PDF Document
pdf_path = "/home/admin/.gemini/antigravity/scratch/cloudflare-data-hub/x402_Data_Hub_Development_Report.pdf"
doc = SimpleDocTemplate(
    pdf_path,
    pagesize=letter,
    leftMargin=54, rightMargin=54, topMargin=54, bottomMargin=54
)

styles = getSampleStyleSheet()

# Custom Styles
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Heading1'],
    fontName=FONT_BOLD,
    fontSize=22,
    leading=26,
    textColor=colors.HexColor('#0F172A'),
    spaceAfter=4
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName=FONT_REG,
    fontSize=11,
    leading=15,
    textColor=colors.HexColor('#10B981'),
    spaceAfter=12
)

h1_style = ParagraphStyle(
    'SectionH1',
    parent=styles['Heading2'],
    fontName=FONT_BOLD,
    fontSize=13,
    leading=16,
    textColor=colors.HexColor('#0F172A'),
    spaceBefore=12,
    spaceAfter=6,
    keepWithNext=True
)

body_style = ParagraphStyle(
    'BodyDark',
    parent=styles['Normal'],
    fontName=FONT_REG,
    fontSize=9,
    leading=13,
    textColor=colors.HexColor('#334155'),
    spaceAfter=6
)

callout_style = ParagraphStyle(
    'CalloutText',
    parent=styles['Normal'],
    fontName=FONT_REG,
    fontSize=9,
    leading=13,
    textColor=colors.HexColor('#065F46')
)

story = []

# Title & Subtitle
story.append(Paragraph("ЗВІТ ПРО РОЗРОБКУ ТА АРХІТЕКТУРУ", title_style))
story.append(Paragraph("Проєкт: <b>Cloudflare x402 Data Hub</b> (x402datahub.io)", subtitle_style))
story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#10B981'), spaceAfter=10))

# Executive Summary Box
summary_text = "<b>Executive Summary:</b> x402 Data Hub — це децентралізована маркетплейс-платформа для надання актуальних структурованих JSON-даних штучному інтелекту (AI-агентам) та розробникам через протокол HTTP 402 (Payment Required) з мікроплатежами у стейблкоїнах (USDC) в мережах Arbitrum One та Base."
summary_table = Table([[Paragraph(summary_text, callout_style)]], colWidths=[504])
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ECFDF5')),
    ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#10B981')),
    ('PADDING', (0,0), (-1,-1), 8),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
]))
story.append(summary_table)
story.append(Spacer(1, 8))

# Section 1: Concept & Evolution
story.append(Paragraph("1. Зародження ідеї та проблема ринку", h1_style))
p1 = ("З розвитком автономних AI-агентів (LangChain, AutoGPT, CrewAI, elizaOS) виникла потреба в отриманні актуальних "
      "структурованих даних у режимі реального часу. Існуючі API-моделі мають суттєві недоліки: вони вимагають "
      "дорогої щомісячної підписки ($50-$500/міс), кредитної картки та ручної реєстрації, що унеможливлює "
      "автономні розрахунки між програмами. Протокол <b>x402</b> вирішує цю проблему за допомогою статусу "
      "HTTP 402 Payment Required та транзакцій у L2-мережах.")
story.append(Paragraph(p1, body_style))

# Section 2: Architecture & Tech Stack
story.append(Paragraph("2. Технічна архітектура та стек", h1_style))
arch_data = [
    [Paragraph("<b>Компонент</b>", body_style), Paragraph("<b>Технологія</b>", body_style), Paragraph("<b>Опис / Роль</b>", body_style)],
    [Paragraph("<b>Frontend / Landing</b>", body_style), Paragraph("HTML5, CSS3, JS, FontAwesome", body_style), Paragraph("Адаптивний інтерфейс з Dark Mode, Glassmorphism, модальними вікнами", body_style)],
    [Paragraph("<b>Domain & CDN</b>", body_style), Paragraph("x402datahub.io / GitHub Pages", body_style), Paragraph("Хостинг на власному домені з SSL-сертифікатом", body_style)],
    [Paragraph("<b>Edge Backend</b>", body_style), Paragraph("Cloudflare Workers", body_style), Paragraph("Бессерверна обробка API-запитів, валідація хедера x-payment-tx", body_style)],
    [Paragraph("<b>Data Storage</b>", body_style), Paragraph("Cloudflare R2 Bucket", body_style), Paragraph("Збереження JSON-датасетів з високою швидкістю доступу", body_style)],
    [Paragraph("<b>On-Chain Verification</b>", body_style), Paragraph("Ethers.js / RPC Nodes", body_style), Paragraph("Перевірка транзакцій у реальному часі в мережах Arbitrum та Base", body_style)],
    [Paragraph("<b>Automation</b>", body_style), Paragraph("GitHub Actions (Cron)", body_style), Paragraph("Автоматичне оновлення даних та завантаження в R2 щодня о 00:00 UTC", body_style)],
    [Paragraph("<b>AI Discovery</b>", body_style), Paragraph("llms.txt Standard", body_style), Paragraph("Стандартизований маніфест для авто-індексації AI-агентами", body_style)]
]
t_arch = Table(arch_data, colWidths=[110, 150, 244])
t_arch.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F1F5F9')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#0F172A')),
    ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
    ('PADDING', (0,0), (-1,-1), 4),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
]))
story.append(t_arch)
story.append(Spacer(1, 8))

# Section 3: Key Features & Milestones
story.append(Paragraph("3. Ключові реалізовані етапи та фічі", h1_style))
milestones = [
    "<b>Етап 1 (Базова інфраструктура):</b> Створення Cloudflare Worker, налаштування R2 та завантаження перших JSON-файлів.",
    "<b>Етап 2 (Інтеграція Web3 & Anti-Replay):</b> Впровадження реальної перевірки транзакцій в Arbitrum та Base через RPC. Додано блокування повторного використання одного Tx Hash (Anti-Replay).",
    "<b>Етап 3 (Freemium Quota):</b> Розробка лічильника <code>Daily 3 Free Requests Quota</code> з автоматичним щоденним скиданням о 00:00 UTC.",
    "<b>Етап 4 (UX Optimizations):</b> Рефакторинг модальних вікон, об'єднання статусу та кнопки в єдиний інтерактивний елемент з бейджем стану.",
    "<b>Етап 5 (Брендинг та AI Ready):</b> Придбання та прив'язка домену <b>x402datahub.io</b>, публікація <code>llms.txt</code> та створення прикладу підключення на Python."
]
for m in milestones:
    story.append(Paragraph(f"• {m}", body_style))

story.append(Spacer(1, 8))

# Section 4: Current Datasets & Categories
story.append(Paragraph("4. Поточна лінійка датасетів (13+ API-ендпоінтів)", h1_style))
story.append(Image(chart1_path, width=6*inch, height=2.6*inch))
story.append(Spacer(1, 8))

# Section 5: Economic Model & Value Proposition
story.append(Paragraph("5. Економічна модель: Pay-per-Request vs Subscriptions", h1_style))
p5 = ("Традиційні SaaS-сервіси вимагають $49-$299 на місяць, що є неефективним для AI-агентів, яким потрібні дані тільки час від часу. "
      "x402 Data Hub пропонує оплату <b>0.01 USDC за запит</b>. Це дає розробникам 90%+ економії та усуває фінансовий бар'єр.")
story.append(Paragraph(p5, body_style))
story.append(Image(chart2_path, width=6*inch, height=2.6*inch))
story.append(Spacer(1, 8))

# Section 6: Next Steps & GTM Strategy
story.append(Paragraph("6. План подальшого розвитку (Go-To-Market)", h1_style))
gtm_items = [
    "<b>Індексація у списку llmstxt.org:</b> Подача заявки для швидкого виявлення хабу моделями OpenAI та Anthropic.",
    "<b>Залучення розробників:</b> Публікація анонсу в r/LocalLLaMA, r/ethdev, Twitter/X (із згадкою Base & Arbitrum).",
    "<b>Розширення SDK:</b> Створення NPM пакета <code>@x402/data-hub-client</code> для розробників на TypeScript/Node.js.",
    "<b>Аналітика:</b> Моніторинг запитів для визначення найпопулярніших категорій та їх подальшого розширення."
]
for item in gtm_items:
    story.append(Paragraph(f"✓ {item}", body_style))

story.append(Spacer(1, 12))

# Footer Sign-off
sign_style = ParagraphStyle(
    'SignOff',
    parent=styles['Normal'],
    fontName=FONT_BOLD,
    fontSize=9,
    textColor=colors.HexColor('#475569'),
    alignment=1
)
story.append(Paragraph("Звіт згенеровано для x402 Data Hub (x402datahub.io) | 2026", sign_style))

# Build Document
doc.build(story, canvasmaker=NumberedCanvas)
print("PDF successfully generated at:", pdf_path)
