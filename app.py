from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS  # Added to allow XAMPP to communicate with Flask
import io
import os
import re
from datetime import datetime
import PyPDF2

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")
STATIC_DIR = os.path.join(BASE_DIR, "static")

app = Flask(__name__, 
            template_folder=TEMPLATE_DIR, 
            static_folder=STATIC_DIR, 
            static_url_path="/static")

# Enable CORS so XAMPP/PHP frontend can fetch data from Flask backend
CORS(app)

UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

COMMON_SKILLS = {
    "python", "java", "javascript", "typescript", "sql", "mysql", "postgresql", "mongodb",
    "flask", "django", "react", "node", "html", "css", "bootstrap", "tailwind", "php",
    "git", "github", "api", "rest", "aws", "excel", "power bi", "tableau", "seo",
    "marketing", "analytics", "communication", "leadership", "management", "sales",
    "figma", "ui", "ux", "testing", "automation", "machine learning", "data analysis"
}

def extract_text(file_path):
    text = ""
    try:
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
    except Exception:
        text = ""
    return text

def clean_words(text):
    return re.findall(r"[a-zA-Z][a-zA-Z0-9+#.\-]*", text.lower())

def normalize_space(text):
    return re.sub(r"\s+", " ", text).strip()

def extract_detected_skills(text_lower):
    found = []
    for skill in sorted(COMMON_SKILLS):
        if skill in text_lower:
            found.append(skill.title())
    return found[:12]

# --- FIXED: No more bold text. Forces normal font-weight and clean layout ---
def format_resume_html(text):
    if not text.strip():
        return "<p style='font-weight: normal;'>No resume content available.</p>"

    # Safely get the name (limit to 40 chars so it doesn't grab a whole paragraph)
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    name = lines[0].title()[:40] if lines else "Candidate"
    
    # Extract actual sentences
    continuous_text = re.sub(r"\s+", " ", text)
    sentences = re.split(r'(?<=[.!?])\s+', continuous_text)
    
    highlights = []
    for sentence in sentences:
        clean_sentence = re.sub(r"^[^a-zA-Z0-9]+", "", sentence).strip()
        word_count = len(clean_sentence.split())
        
        # Grab normal length sentences to act as resume bullet points
        if 5 < word_count < 35:
            if not clean_sentence.endswith('.'):
                clean_sentence += '.'
            highlights.append(clean_sentence)
        
        if len(highlights) == 5: 
            break

    # Fallback if parsing fails
    if not highlights:
        highlights = lines[1:6] if len(lines) > 1 else ["Content successfully loaded."]

    # Force normal font weight on list items to stop the bolding issue
    bullets_html = "".join(f"<li style='font-weight: normal; margin-bottom: 8px;'>{item}</li>" for item in highlights)

    return f"""
        <h2 style="margin-top: 0; margin-bottom: 15px;">{name}</h2>
        <hr style="border: 0; border-top: 1px solid #d8dfec; margin-bottom: 15px;">
        <ul style="line-height: 1.6; padding-left: 20px;">{bullets_html}</ul>
    """
# ---------------------------------------------------

def format_job_desc_html(job_desc):
    cleaned_lines = [line.strip() for line in job_desc.splitlines() if line.strip()]

    if not cleaned_lines:
        return """
            <h3 style="margin-top: 0;">No Job Description Added</h3>
            <p style="font-weight: normal;">Paste a target job description to calculate keyword match and improve ATS analysis.</p>
        """

    heading = cleaned_lines[0][:50]
    remaining = cleaned_lines[1:] if len(cleaned_lines) > 1 else []
    bullets = remaining[:6] if remaining else ["Job description captured."]
    bullet_html = "".join(f"<li style='font-weight: normal; margin-bottom: 8px;'>{line.lstrip('•-* ').strip()}</li>" for line in bullets)

    return f"""
        <h3 style="margin-top: 0; margin-bottom: 10px;">{heading}</h3>
        <h4 style="margin-top: 0; margin-bottom: 10px;">Responsibilities:</h4>
        <ul style="line-height: 1.6; padding-left: 20px;">{bullet_html}</ul>
    """

def detect_job_idea(text_lower):
    if any(word in text_lower for word in ["python", "flask", "django", "developer", "software", "react", "api"]):
        return "Software Engineer"
    if any(word in text_lower for word in ["marketing", "campaign", "seo", "brand", "social media"]):
        return "Marketing Specialist"
    if any(word in text_lower for word in ["data", "analytics", "sql", "dashboard", "tableau", "power bi"]):
        return "Data Analyst"
    if any(word in text_lower for word in ["design", "figma", "ui", "ux", "wireframe"]):
        return "UI/UX Designer"
    if any(word in text_lower for word in ["sales", "business development", "client"]):
        return "Business Development Executive"
    return "General Professional"

def build_suggestions(text_lower, sections_present, missing_skills, keyword_match, word_count, achievements_count):
    suggestions = []

    if "experience" not in sections_present:
        suggestions.append("Add a clear Work Experience section.")
    if "skills" not in sections_present:
        suggestions.append("Add a dedicated Skills section for ATS readability.")
    if "education" not in sections_present:
        suggestions.append("Include an Education section.")
    if word_count < 220:
        suggestions.append("Increase resume detail with stronger project and achievement bullets.")
    if achievements_count < 3:
        suggestions.append("Add more quantified achievements using numbers or percentages.")
    if keyword_match < 55 and missing_skills:
        suggestions.append("Include more relevant job keywords such as: " + ", ".join(missing_skills[:3]) + ".")
    if "summary" not in sections_present and "objective" not in sections_present:
        suggestions.append("Add a short professional summary at the top.")

    if not suggestions:
        suggestions = ["Your resume is well-structured. Focus on role-specific keyword tailoring."]

    return suggestions[:5]

def analyze_resume(text, job_desc=""):
    text = normalize_space(text)
    job_desc = normalize_space(job_desc)

    text_lower = text.lower()
    job_lower = job_desc.lower()

    text_words = set(clean_words(text))
    job_words = set(clean_words(job_desc))
    text_word_count = len(clean_words(text))
    match_words = text_words & job_words

    section_patterns = {
        "experience": ["experience", "work history", "employment"],
        "education": ["education", "qualification"],
        "skills": ["skills", "technical skills", "core competencies"],
        "projects": ["project", "projects"],
        "summary": ["summary", "profile"],
        "objective": ["objective"],
        "certifications": ["certification", "certifications"],
    }

    sections_present = {
        name
        for name, keywords in section_patterns.items()
        if any(keyword in text_lower for keyword in keywords)
    }

    achievements_count = len(re.findall(r"\b\d+%|\b\d+\+|\b\d+\b", text))
    email_present = bool(re.search(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text))
    phone_present = bool(re.search(r"(\+?\d[\d\s\-]{8,}\d)", text))
    linkedin_present = "linkedin" in text_lower
    detected_skills = extract_detected_skills(text_lower)

    if job_words:
        raw_keyword_match = int((len(match_words) / max(len(job_words), 1)) * 100)
    else:
        raw_keyword_match = min(100, 35 + len(detected_skills) * 4)

    keyword_match = max(0, min(100, raw_keyword_match))

    length_score = min(100, int((text_word_count / 450) * 100))
    structure_score = 0
    structure_score += 18 if email_present else 0
    structure_score += 15 if phone_present else 0
    structure_score += 10 if linkedin_present else 0
    structure_score += min(35, len(sections_present) * 7)
    structure_score += min(22, achievements_count * 4)
    structure_score = min(100, structure_score)

    content_score = int(
        min(
            100,
            (length_score * 0.35)
            + (structure_score * 0.30)
            + (min(100, len(detected_skills) * 8) * 0.20)
            + (min(100, achievements_count * 10) * 0.15),
        )
    )

    ats_score = int(
        min(
            100,
            (structure_score * 0.45)
            + (keyword_match * 0.30)
            + (content_score * 0.25),
        )
    )

    formatting_score = int(
        min(
            100,
            (20 if text_word_count > 0 else 0)
            + (20 if email_present else 0)
            + (20 if phone_present else 0)
            + (15 if linkedin_present else 0)
            + min(25, len(sections_present) * 5),
        )
    )

    final_score = int(
        min(
            100,
            (ats_score * 0.35)
            + (content_score * 0.30)
            + (keyword_match * 0.20)
            + (formatting_score * 0.15),
        )
    )

    final_score = max(18, final_score)

    missing_skills = []
    if job_words:
        possible_missing = sorted(job_words - text_words)
        filtered_missing = [word for word in possible_missing if len(word) > 2]
        missing_skills = filtered_missing[:6]

    skills_gap = len(missing_skills)
    boosted_highlights = max(1, min(8, achievements_count + len(detected_skills) // 2))
    job_idea = detect_job_idea(text_lower)

    suggestions = build_suggestions(
        text_lower,
        sections_present,
        missing_skills,
        keyword_match,
        text_word_count,
        achievements_count,
    )

    report_lines = [
        "AI CV Analyser Report",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        f"Resume Score: {final_score}",
        f"Job Match: {keyword_match}%",
        f"ATS Compatibility: {ats_score}%",
        f"Content Strength: {content_score}%",
        f"Keyword Match: {keyword_match}%",
        f"Formatting: {formatting_score}%",
        f"Suggested Role: {job_idea}",
        f"Detected Skills: {', '.join(detected_skills) if detected_skills else 'None detected'}",
        "",
        "Suggestions:",
    ] + [f"- {item}" for item in suggestions]

    if missing_skills:
        report_lines += ["", "Missing Skills:"] + [f"- {skill}" for skill in missing_skills]

    return {
        "score": final_score,
        "job_match": keyword_match,
        "suggestions": suggestions,
        "job_idea": job_idea,
        "ats": ats_score,
        "content": content_score,
        "keywords_score": keyword_match,
        "formatting": formatting_score,
        "skills_gap": skills_gap,
        "missing_skills": missing_skills,
        "boosted_highlights": boosted_highlights,
        "resume_html": format_resume_html(text),
        "job_html": format_job_desc_html(job_desc),
        "report_text": "\n".join(report_lines),
    }

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"})

        file = request.files["file"]

        if file.filename == "":
            return jsonify({"error": "Empty file"})

        job_desc = request.form.get("job_desc", "")

        filepath = os.path.join(app.config["UPLOAD_FOLDER"], file.filename)
        file.save(filepath)

        text = extract_text(filepath)

        if text.strip() == "":
            return jsonify({"error": "Could not read PDF. Make sure it is text-based."})

        result = analyze_resume(text, job_desc)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/download-report", methods=["POST"])
def download_report():
    data = request.get_json(silent=True) or {}
    report_text = data.get("report_text", "AI CV Analyser Report")

    buffer = io.BytesIO(report_text.encode("utf-8"))
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name="cv_analysis_report.txt",
        mimetype="text/plain",
    )

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True, use_reloader=False)