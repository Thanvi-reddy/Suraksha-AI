Suraksha AI



AI-powered Decision Intelligence for Resilient Energy Security



<p align="center">

&#x20; <img src="assets/suraksha-home.png" alt="Suraksha AI" width="900"/>

</p>







Overview



Suraksha AI is an AI-powered platform that helps organizations monitor energy supply networks, identify potential risks, simulate disruption scenarios, and receive intelligent recommendations for resilient procurement planning.


**Note on scenario data:** The Jan–Jun 2026 crisis timeline used to demo the platform (Hormuz closure, pipeline attacks, price spikes, etc.) is a fictional, hypothetical scenario built to stress-test the risk and simulation engines. It is not a record of real events. All underlying math (risk scoring, substitution pressure, cost impact, SPR survival days) is computed deterministically by the risk engine from this synthetic data — the AI Copilot only explains and narrates the numbers, it never invents or recomputes them.


The platform combines interactive visualization, predictive analysis, and an AI Copilot to support faster and more informed decision-making.







Key Features



\- AI Copilot for intelligent decision support

\- Interactive dashboard for energy risk monitoring

\- Supply route visualization

\- Risk analysis and disruption detection

\- Scenario simulation

\- Procurement strategy recommendations

\- Baseline risk monitoring







Future Scope



Suraksha AI can be expanded with:



\- Real-time energy market integration

\- Weather and satellite data analysis

\- Predictive AI models

\- Cloud deployment

\- Mobile application

\- Automated alerts

\- PDF report generation

\- Multi-country energy network monitoring







Technology Stack



| Frontend | Backend | AI         |



| React    | FastAPI | Groq LLM   |

| Vite     | Python  | AI Copilot |

| Axios    | Uvicorn |            |

|FramerMotion| REST APIs |        |







How to Run



Clone the repository



```bash

git clone https://github.com/Thanvi-reddy/Suraksha-AI.git

cd Suraksha-AI

```



Backend



```bash

cd backend



python -m venv venv



venv\\Scripts\\activate



pip install -r requirements.txt



python -m uvicorn main:app --reload --port 8000

```



Create a `.env` file:



```env

GROQ_API_KEY=YOUR_GROQ_API_KEY

```



Frontend



```bash

cd frontend



npm install



npm run dev

```



Open:



```

http://localhost:5173

```







Developer



Yeturu Thanvi





GitHub: https://github.com/Thanvi-reddy







Hackathon Project



Built as a hackathon solution to demonstrate how Artificial Intelligence can improve energy resilience through intelligent risk analysis, simulation, and AI-assisted decision support.

