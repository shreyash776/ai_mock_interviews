# PrepWise — AI-powered Interview Practice Platform

**Deployed:** https://ai-mock-interviews-jet.vercel.app/sign-in  


PrepWise is an interactive AI-driven interview preparation platform where users can practice interviews in a natural conversational style. Users create a profile, specify their experience, job title, tech stack, difficulty level, and number of questions — and PrepWise generates a fully customized interview using **OpenAI** and **Vapi** for voice-based communication.  
Every interview is saved to a personal workspace, and users receive **detailed feedback**, **section-wise scoring**, and **actionable improvement suggestions**.

---

## 🌟 Why PrepWise Stands Out

- **Natural, human-like mock interviews** using AI voice powered by Vapi  
- **Fully customizable interview creation** (experience, job title, difficulty, tech stack, question count)  
- **AI-generated structured interviews** using OpenAI  
- **Detailed scoring** with section-wise breakdown  
- **Areas of improvement** generated after every session  
- **Workspace with saved interviews** for long-term progress tracking  
- **Built with Next.js** for performance, scalability, and smooth UX  

---

## 🚀 Features

- User profile creation & onboarding
- Voice-enabled interview conversation (AI speaks and listens)
- Custom AI interview generator
- Real-time Q&A with conversational flow
- Evaluation engine:
  - Overall score  
  - Category-wise score (e.g., Algorithms, Backend Skills, System Design, Behavioral)  
  - Improvement areas  
- Workspace to view past interviews anytime
- Smooth UI optimized for both desktop & mobile

---

## 🧩 Tech Stack

- **Framework:** Next.js  
- **AI:** OpenAI (LLM for question generation, scoring, feedback)  
- **Voice AI:** Vapi (conversation with voice input/output)  
- **Database:** (Add your DB here e.g., Supabase / MongoDB / PostgreSQL)  
- **Auth:** (NextAuth / Custom JWT — add yours)  
- **Deployment:** Vercel *(recommended)*  

---

## 🔧 Local Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/prepwise.git
cd prepwise

# Install dependencies
npm install
# or yarn
# or pnpm

# Setup environment variables
cp .env.example .env.local
OPENAI_API_KEY=sk-...
VAPI_API_KEY=...
DATABASE_URL=...
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_VERCEL_URL=http://localhost:3000
