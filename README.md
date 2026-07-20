\# 🛡️ Suraksha AI

\### AI-powered Decision Intelligence for Resilient Energy Security



<p align="center">

&#x20; <img src="assets/suraksha-home.png" alt="Suraksha AI Dashboard" width="900">

</p>



<p align="center">

An intelligent platform that helps detect energy supply risks, simulate disruptions, and generate AI-powered procurement recommendations.

</p>



\---



\# 🚨 Problem Statement



Energy supply chains are vulnerable to disruptions caused by geopolitical conflicts, transportation failures, natural disasters, and infrastructure issues. These disruptions can lead to shortages, increased costs, and delayed decision-making.



Existing systems primarily monitor data but provide limited predictive analysis and intelligent recommendations for handling supply chain risks.



\---



\# 💡 Our Solution



Suraksha AI is an AI-powered decision intelligence platform that enables organizations to:



\- Detect potential energy supply risks

\- Visualize supply routes

\- Simulate disruption scenarios

\- Compare alternative procurement strategies

\- Receive AI-powered recommendations through an intelligent Copilot



The platform assists decision-makers in taking faster and smarter actions during supply chain disruptions.



\---



\# ✨ Key Features



\- 🤖 AI Copilot powered by Groq LLM

\- 📊 Interactive Risk Dashboard

\- 🗺️ Supply Route Visualization

\- ⚠️ Risk Assessment

\- 🔄 Disruption Simulation

\- 📈 Procurement Strategy Generator

\- 📉 Baseline Risk Monitoring

\- ⚡ Fast and Responsive Interface



\---



\# 🛠️ Technology Stack



\## Frontend



\- React

\- Vite

\- Axios

\- Framer Motion

\- CSS



\## Backend



\- Python

\- FastAPI

\- Uvicorn

\- Groq API

\- Python-dotenv



\---



\# 🏗️ System Architecture



```

&#x20;                +----------------------+

&#x20;                |   React + Vite UI    |

&#x20;                +----------+-----------+

&#x20;                           |

&#x20;                           |

&#x20;                    REST API Calls

&#x20;                           |

&#x20;                           |

&#x20;                +----------v-----------+

&#x20;                |   FastAPI Backend    |

&#x20;                +----------+-----------+

&#x20;                           |

&#x20;        +------------------+------------------+

&#x20;        |                  |                  |

&#x20;        |                  |                  |

&#x20;Risk Analysis      Simulation Engine     AI Copilot

&#x20;        |                  |                  |

&#x20;        +------------------+------------------+

&#x20;                           |

&#x20;                    Groq Large Language Model

```



\---



\# 📸 Application Preview



<p align="center">

<img src="assets/suraksha-home.png" width="900">

</p>



\---



\# 🚀 Installation



\## Clone Repository



```bash

git clone https://github.com/Thanvi-reddy/Suraksha-AI.git

cd Suraksha-AI

```



\---



\## Backend



```bash

cd backend



python -m venv venv

```



\### Windows



```bash

venv\\Scripts\\activate

```



\### Install Dependencies



```bash

pip install -r requirements.txt

```



Create a `.env` file inside the backend folder.



```env

GROQ\_API\_KEY=YOUR\_GROQ\_API\_KEY

```



Start the backend.



```bash

python -m uvicorn main:app --reload --port 8000

```



Backend URL



```

http://localhost:8000

```



\---



\## Frontend



```bash

cd frontend



npm install



npm run dev

```



Frontend URL



```

http://localhost:5173

```



\---



\# 📡 API Endpoints



| Method | Endpoint | Description |

|--------|----------|-------------|

| GET | /api/health | Health Check |

| GET | /api/events | Event Data |

| GET | /api/baseline | Baseline Metrics |

| GET | /api/network-config | Network Configuration |

| GET | /api/network/{date} | Network Details |

| GET | /api/risk/{route\_id}/{date} | Risk Analysis |

| POST | /api/simulate | Run Simulation |

| POST | /api/compare | Compare Strategies |

| POST | /api/chat | AI Copilot |

| POST | /api/procurement-plan | Procurement Recommendation |



\---



\# 🌍 Real-World Impact



Suraksha AI supports organizations by:



\- Improving energy security planning

\- Reducing decision-making time

\- Predicting supply-chain risks

\- Recommending resilient procurement strategies

\- Enhancing operational resilience



\---



\# 🔮 Future Enhancements



\- Real-time energy market integration

\- Predictive analytics using historical data

\- Cloud deployment

\- User authentication

\- Mobile application

\- Multi-country energy network support

\- PDF report generation

\- Live alert system



\---



\# 👥 Team



\*\*Yeturu Thanvi\*\*



GitHub: https://github.com/Thanvi-reddy



\---



\# 🏆 Hackathon Submission



This project was developed as a hackathon solution to demonstrate how Artificial Intelligence can improve decision-making, risk analysis, and procurement planning in energy supply networks.



\---



\# 📄 License



This project is intended for educational, research, and hackathon demonstration purposes.

