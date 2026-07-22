import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { api } from './api/client'
import './App.css'

const TIMELINE_DATES = [
  { date: '2026-01-15', label: 'Jan 15', event: 'Normal' },
  { date: '2026-02-28', label: 'Feb 28', event: 'Strikes' },
  { date: '2026-03-04', label: 'Mar 4', event: 'Hormuz Closed' },
  { date: '2026-03-06', label: 'Mar 6', event: 'US Waiver' },
  { date: '2026-03-11', label: 'Mar 11', event: '$113/bbl' },
  { date: '2026-04-01', label: 'Apr 1', event: 'Pipeline Attack' },
  { date: '2026-04-07', label: 'Apr 7', event: 'Fujairah Hit' },
  { date: '2026-04-10', label: 'Apr 10', event: 'UN Vetoed' },
  { date: '2026-05-01', label: 'May 1', event: 'India Reroutes' },
  { date: '2026-06-15', label: 'Jun 15', event: 'Ceasefire' },
  { date: '2026-06-25', label: 'Jun 25', event: 'Recovery' }
]

const NAVIGATION = [
  { id: 'overview', number: '01', label: 'Overview' },
  { id: 'map', number: '02', label: 'Risk Map' },
  { id: 'simulation', number: '03', label: 'Simulation' },
  {
    id: 'recommendations',
    number: '04',
    label: 'Recommendations'
  },
  { id: 'ai', number: '05', label: 'AI Copilot' }
]

const MAP_COORDINATES = {
  hormuz: {
    x: 430,
    y: 170,
    controlX: 600,
    controlY: 150,
    shortLabel: 'Hormuz'
  },

  saudi_pipeline: {
    x: 320,
    y: 245,
    controlX: 550,
    controlY: 230,
    shortLabel: 'Saudi Pipeline'
  },

  fujairah_bypass: {
    x: 500,
    y: 245,
    controlX: 635,
    controlY: 215,
    shortLabel: 'Fujairah'
  },

  red_sea: {
    x: 270,
    y: 335,
    controlX: 505,
    controlY: 350,
    shortLabel: 'Red Sea'
  },

  cape: {
    x: 155,
    y: 455,
    controlX: 490,
    controlY: 520,
    shortLabel: 'Cape Route'
  },

  cape_of_good_hope: {
    x: 155,
    y: 455,
    controlX: 490,
    controlY: 520,
    shortLabel: 'Cape Route'
  },

  cape_good_hope: {
    x: 155,
    y: 455,
    controlX: 490,
    controlY: 520,
    shortLabel: 'Cape Route'
  },

  northern: {
    x: 595,
    y: 85,
    controlX: 720,
    controlY: 105,
    shortLabel: 'Northern Route'
  },

  northern_route: {
    x: 595,
    y: 85,
    controlX: 720,
    controlY: 105,
    shortLabel: 'Northern Route'
  }
}

const DEFAULT_MAP_POSITIONS = [
  {
    x: 430,
    y: 170,
    controlX: 600,
    controlY: 150
  },
  {
    x: 320,
    y: 245,
    controlX: 550,
    controlY: 230
  },
  {
    x: 500,
    y: 245,
    controlX: 635,
    controlY: 215
  },
  {
    x: 270,
    y: 335,
    controlX: 505,
    controlY: 350
  },
  {
    x: 155,
    y: 455,
    controlX: 490,
    controlY: 520
  },
  {
    x: 595,
    y: 85,
    controlX: 720,
    controlY: 105
  }
]

const COUNTRY_FLAGS = {
  Russia: '🇷🇺',
  Brazil: '🇧🇷',
  Guyana: '🇬🇾',
  Norway: '🇳🇴',
  USA: '🇺🇸',
  'United States': '🇺🇸',
  UAE: '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  Iraq: '🇮🇶',
  Kuwait: '🇰🇼',
  Nigeria: '🇳🇬',
  Angola: '🇦🇴',
  Mexico: '🇲🇽',
  Canada: '🇨🇦',
  Oman: '🇴🇲',
  Qatar: '🇶🇦'
}

function getCountryFlag(countryName) {
  return COUNTRY_FLAGS[countryName] || '◆'
}

function formatRouteName(routeId = '') {
  return routeId
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

function getRiskColor(score = 0) {
  if (score >= 75) return '#ef4444'
  if (score >= 40) return '#f97316'
  return '#22c55e'
}

function getRiskClass(score = 0) {
  if (score >= 75) return 'critical'
  if (score >= 40) return 'elevated'
  return 'stable'
}

function getRiskNarrative(score = 0) {
  if (score >= 75) {
    return {
      headline: 'Severe supply disruption risk detected',
      explanation:
        'Multiple energy corridors require immediate intervention and coordinated procurement action.',
      action:
        'Activate emergency rerouting, secure alternative cargoes and evaluate strategic reserve drawdown.'
    }
  }

  if (score >= 40) {
    return {
      headline: 'Elevated geopolitical and logistics risk',
      explanation:
        'One or more important supply routes are experiencing increased disruption pressure.',
      action:
        'Diversify procurement, reserve tanker capacity and prepare alternative routes.'
    }
  }

  return {
    headline: 'Energy supply network remains stable',
    explanation:
      'No major national disruption is detected for the selected timeline date.',
    action:
      'Maintain normal procurement while monitoring Hormuz, the Red Sea and alternative corridors.'
  }
}

function MetricCard({
  label,
  value,
  unit,
  tone = 'default'
}) {
  return (
    <motion.article
      className={`command-metric-card ${tone}`}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="command-metric-label">{label}</div>
      <div className="command-metric-value">{value}</div>
      <div className="command-metric-unit">{unit}</div>
    </motion.article>
  )
}

function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="command-page-heading">
      <div className="command-page-eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

function CorridorMap({
  networkState,
  onOpenSimulation
}) {
  const routeEntries = Object.entries(
    networkState?.route_risks || {}
  )

  const indiaX = 790
  const indiaY = 285

  return (
    <div className="energy-map-layout">
      <div className="energy-map-panel">
        <div className="energy-map-toolbar">
          <div>
            <span className="energy-map-live-dot" />
            Selected timeline state
          </div>

          <div className="energy-map-legend">
            <span>
              <i className="legend-dot stable" />
              Stable
            </span>

            <span>
              <i className="legend-dot elevated" />
              Elevated
            </span>

            <span>
              <i className="legend-dot critical" />
              Critical
            </span>
          </div>
        </div>

        <svg
          className="energy-map"
          viewBox="0 0 1000 540"
          role="img"
          aria-label="India energy supply corridor risk map"
        >
          <defs>
            <radialGradient id="indiaGlow">
              <stop
                offset="0%"
                stopColor="#f5a623"
                stopOpacity="0.75"
              />

              <stop
                offset="100%"
                stopColor="#f5a623"
                stopOpacity="0"
              />
            </radialGradient>

            <filter id="routeGlow">
              <feGaussianBlur
                stdDeviation="3.5"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect
            x="0"
            y="0"
            width="1000"
            height="540"
            rx="24"
            className="map-ocean"
          />

          <path
            className="map-grid-line"
            d="M0 135 H1000 M0 270 H1000 M0 405 H1000"
          />

          <path
            className="map-grid-line"
            d="M200 0 V540 M400 0 V540 M600 0 V540 M800 0 V540"
          />

          <path
            className="map-landmass"
            d="M70 85 C135 35 235 50 280 110 C315 160 300 220 245 245 C190 270 145 238 110 195 C80 160 40 120 70 85Z"
          />

          <path
            className="map-landmass"
            d="M230 245 C300 205 390 212 430 270 C455 310 440 360 400 395 C365 425 345 485 295 498 C245 510 210 465 220 420 C230 370 190 295 230 245Z"
          />

          <path
            className="map-landmass"
            d="M350 85 C440 35 580 42 665 90 C725 125 770 175 748 225 C725 270 650 272 590 250 C525 228 480 225 438 195 C395 165 320 130 350 85Z"
          />

          <path
            className="map-landmass"
            d="M650 205 C715 170 820 180 885 230 C940 275 950 335 905 375 C865 410 790 395 742 350 C705 315 642 275 650 205Z"
          />

          <path
            className="map-landmass"
            d="M835 390 C885 365 940 385 955 430 C965 470 935 505 885 508 C838 510 798 475 805 430 C808 412 820 398 835 390Z"
          />

          {routeEntries.map(
            ([routeId, routeData], index) => {
              const position =
                MAP_COORDINATES[routeId] ||
                DEFAULT_MAP_POSITIONS[
                  index % DEFAULT_MAP_POSITIONS.length
                ]

              const score =
                Number(routeData.combined_score) || 0

              const color = getRiskColor(score)

              const path = `M ${position.x} ${position.y} Q ${position.controlX} ${position.controlY} ${indiaX} ${indiaY}`

              return (
                <g key={routeId}>
                  <path
                    d={path}
                    className="energy-route-glow"
                    stroke={color}
                  />

                  <path
                    d={path}
                    className="energy-route-line"
                    stroke={color}
                    filter="url(#routeGlow)"
                  />

                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="17"
                    fill={color}
                    opacity="0.1"
                  />

                  <circle
                    cx={position.x}
                    cy={position.y}
                    r="6"
                    fill={color}
                    className="energy-map-node"
                  />

                  <text
                    x={position.x}
                    y={position.y - 20}
                    className="map-node-label"
                    textAnchor="middle"
                  >
                    {position.shortLabel ||
                      formatRouteName(routeId)}
                  </text>

                  <text
                    x={position.x}
                    y={position.y + 31}
                    className="map-node-score"
                    textAnchor="middle"
                    fill={color}
                  >
                    {score}/100
                  </text>
                </g>
              )
            }
          )}

          <circle
            cx={indiaX}
            cy={indiaY}
            r="58"
            fill="url(#indiaGlow)"
          />

          <circle
            cx={indiaX}
            cy={indiaY}
            r="17"
            className="india-node"
          />

          <circle
            cx={indiaX}
            cy={indiaY}
            r="29"
            className="india-node-ring"
          />

          <text
            x={indiaX}
            y={indiaY - 48}
            className="india-label"
            textAnchor="middle"
          >
            INDIA
          </text>

          <text
            x={indiaX}
            y={indiaY + 57}
            className="india-sub-label"
            textAnchor="middle"
          >
            Energy demand centre
          </text>
        </svg>
      </div>

      <aside className="energy-map-side-panel">
        <div className="map-side-title">
          Route intelligence
        </div>

        <div className="map-route-list">
          {routeEntries.map(
            ([routeId, routeData]) => {
              const score =
                Number(routeData.combined_score) || 0

              return (
                <div
                  className="map-route-row"
                  key={routeId}
                >
                  <div>
                    <span
                      className="map-route-status-dot"
                      style={{
                        backgroundColor:
                          getRiskColor(score)
                      }}
                    />

                    <strong>
                      {formatRouteName(routeId)}
                    </strong>
                  </div>

                  <span
                    style={{
                      color: getRiskColor(score)
                    }}
                  >
                    {score}
                  </span>
                </div>
              )
            }
          )}
        </div>

        <button
          type="button"
          className="command-primary-button full-width"
          onClick={onOpenSimulation}
        >
          Simulate a disruption
          <span>→</span>
        </button>
      </aside>
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('splash')
  const [isEntering, setIsEntering] = useState(false)

  const [activeSection, setActiveSection] =
    useState('overview')

  const [currentDateIndex, setCurrentDateIndex] =
    useState(0)

  const [networkState, setNetworkState] =
    useState(null)

  const [loading, setLoading] = useState(false)

  const [simResult, setSimResult] = useState(null)
  const [simLoading, setSimLoading] =
    useState(false)

  const [chatMessages, setChatMessages] = useState([
    {
      role: 'ai',
      text:
        'Welcome to Suraksha AI. Select a timeline date or ask about route risk, disruption impact and resilient procurement options.'
    }
  ])

  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] =
    useState(false)

  const currentTimeline =
    TIMELINE_DATES[currentDateIndex]

  const currentDate = currentTimeline.date

  useEffect(() => {
    if (screen === 'app') {
      fetchNetwork()
    }
  }, [currentDateIndex, screen])

  const fetchNetwork = async () => {
    setLoading(true)

    try {
      const response = await api.getNetwork(currentDate)
      setNetworkState(response.data)
    } catch (error) {
      console.error('Failed to fetch network:', error)
    } finally {
      setLoading(false)
    }
  }

  const enterCommandCenter = () => {
    setIsEntering(true)

    window.setTimeout(() => {
      setScreen('app')
      setIsEntering(false)
    }, 1000)
  }

  const handleSimulate = async (
    routes,
    days,
    label
  ) => {
    setSimLoading(true)
    setSimResult(null)

    try {
      const response = await api.simulate({
        affected_routes: routes,
        duration_days: days,
        label
      })

      setSimResult(response.data)
    } catch (error) {
      console.error('Simulation failed:', error)
    } finally {
      setSimLoading(false)
    }
  }

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return

    const question = chatInput.trim()

    setChatInput('')

    setChatMessages(previousMessages => [
      ...previousMessages,
      {
        role: 'user',
        text: question
      }
    ])

    setChatLoading(true)

    try {
      const response = await api.chat(
        question,
        currentDate
      )

      setChatMessages(previousMessages => [
        ...previousMessages,
        {
          role: 'ai',
          text: response.data.answer
        }
      ])
    } catch (error) {
      console.error('AI request failed:', error)

      setChatMessages(previousMessages => [
        ...previousMessages,
        {
          role: 'ai',
          text:
            'I could not connect to the AI service. Check whether the FastAPI backend and Groq configuration are running correctly.'
        }
      ])
    } finally {
      setChatLoading(false)
    }
  }

  const routeEntries = Object.entries(
    networkState?.route_risks || {}
  )

  const sortedRoutes = [...routeEntries].sort(
    (firstRoute, secondRoute) =>
      Number(secondRoute[1].combined_score || 0) -
      Number(firstRoute[1].combined_score || 0)
  )

  const safestRoutes = [...routeEntries].sort(
    (firstRoute, secondRoute) =>
      Number(firstRoute[1].combined_score || 0) -
      Number(secondRoute[1].combined_score || 0)
  )

  const highestRiskRoute = sortedRoutes[0]
  const safestRoute = safestRoutes[0]

  const nationalRiskScore =
    Number(networkState?.national_risk_score) || 0

  const riskNarrative =
    getRiskNarrative(nationalRiskScore)

  const selectedEventName =
    networkState?.latest_event?.event_name ||
    currentTimeline.event ||
    'No major event'

  const selectedEventSource =
    networkState?.latest_event?.scenario_basis ||
    'Suraksha AI prototype dataset'

  if (screen === 'splash') {
    return (
      <AnimatePresence mode="wait">
        <motion.main
          className="suraksha-splash"
          initial={{ opacity: 0 }}
          animate={{
            opacity: isEntering ? 0 : 1,
            scale: isEntering ? 1.04 : 1
          }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut'
          }}
        >
          <div className="splash-grid" />

          <motion.div
            className="splash-orbit splash-orbit-one"
            animate={{ rotate: 360 }}
            transition={{
              duration: 32,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          <motion.div
            className="splash-orbit splash-orbit-two"
            animate={{ rotate: -360 }}
            transition={{
              duration: 42,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          <motion.div
            className="suraksha-splash-content"
            initial={{
              opacity: 0,
              y: 35
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.9
            }}
          >
            <motion.div
              className="suraksha-logo-wrap"
              initial={{
                opacity: 0,
                scale: 0.7
              }}
              animate={{
                opacity: 1,
                scale: 1
              }}
              transition={{
                duration: 0.9,
                delay: 0.15,
                type: 'spring',
                stiffness: 90
              }}
            >
              <img
                src="/suraksha-logo.png"
                alt="Suraksha AI logo"
                className="suraksha-logo"
              />
            </motion.div>

            <motion.h1
              className="suraksha-title"
              initial={{
                opacity: 0,
                y: 15
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: 0.5,
                duration: 0.7
              }}
            >
              SURAKSHA <span>AI</span>
            </motion.h1>

            <motion.p
              className="suraksha-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 0.8,
                duration: 0.7
              }}
            >
              Intelligence for resilient energy security.
            </motion.p>

            <motion.p
              className="suraksha-description"
              initial={{
                opacity: 0,
                y: 10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: 1,
                duration: 0.7
              }}
            >
              AI-powered decision intelligence that helps
              India detect energy supply risks, simulate
              disruptions and identify resilient procurement
              actions.
            </motion.p>

            <motion.button
              type="button"
              className="enter-command-button"
              onClick={enterCommandCenter}
              disabled={isEntering}
              initial={{
                opacity: 0,
                y: 18
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                delay: 1.2,
                duration: 0.6
              }}
              whileHover={{
                scale: 1.04,
                boxShadow:
                  '0 0 35px rgba(245, 166, 35, 0.35)'
              }}
              whileTap={{
                scale: 0.97
              }}
            >
              <span className="enter-button-icon">
                ◆
              </span>

              <span>
                {isEntering
                  ? 'Opening Command Center...'
                  : 'Enter Command Center'}
              </span>

              <span className="enter-button-arrow">
                →
              </span>
            </motion.button>

            <motion.div
              className="splash-status"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1.5
              }}
            >
              <span className="status-dot" />
              Energy intelligence system ready
            </motion.div>
          </motion.div>

          {isEntering && (
            <motion.div
              className="entry-flash"
              initial={{
                scaleX: 0,
                opacity: 0
              }}
              animate={{
                scaleX: 1,
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 0.9
              }}
            />
          )}
        </motion.main>
      </AnimatePresence>
    )
  }

  return (
    <motion.div
      className="command-shell"
      initial={{
        opacity: 0
      }}
      animate={{
        opacity: 1
      }}
      transition={{
        duration: 0.6
      }}
    >
      <aside className="command-sidebar">
        <div className="command-brand">
          <img
            src="/suraksha-logo.png"
            alt="Suraksha AI"
            className="command-brand-logo"
          />

          <div>
            <div className="command-brand-name">
              SURAKSHA <span>AI</span>
            </div>

            <div className="command-brand-tagline">
              Energy Security Intelligence
            </div>
          </div>
        </div>

        <nav className="command-navigation">
          <div className="command-navigation-label">
            Command centre
          </div>

          {NAVIGATION.map(item => (
            <button
              type="button"
              key={item.id}
              className={`command-navigation-button ${
                activeSection === item.id
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveSection(item.id)
              }
            >
              <span className="command-navigation-number">
                {item.number}
              </span>

              <span>{item.label}</span>

              {activeSection === item.id && (
                <motion.span
                  className="command-navigation-indicator"
                  layoutId="navigation-indicator"
                />
              )}
            </button>
          ))}
        </nav>

        <div className="command-sidebar-footer">
          <div className="command-system-status">
            <span className="command-system-dot" />

            <div>
              <strong>System operational</strong>
              <small>Backend connected</small>
            </div>
          </div>

          <div className="command-model-label">
            Timeline-based crisis intelligence prototype
          </div>
        </div>
      </aside>

      <main className="command-main">
        <header className="command-topbar">
          <div>
            <div className="command-topbar-label">
              Selected timeline date
            </div>

            <div className="command-topbar-date">
              {currentTimeline.label}, 2026
            </div>
          </div>

          <div className="command-topbar-stats">
            <div>
              <small>Brent crude</small>

              <strong>
                $
                {networkState?.brent_price ?? '--'}
                /bbl
              </strong>
            </div>

            <div>
              <small>Imports affected</small>

              <strong className="warning-text">
                {networkState?.volume_affected_pct ??
                  0}
                %
              </strong>
            </div>

            <div
              className={`command-risk-badge ${getRiskClass(
                nationalRiskScore
              )}`}
            >
              <small>National risk</small>

              <strong>
                {networkState?.national_risk_level ||
                  'Loading'}
              </strong>

              <span>
                {nationalRiskScore}/100
              </span>
            </div>
          </div>
        </header>

        <section className="command-timeline">
          <div className="command-timeline-heading">
            <div>
              <strong>
                2026 Hormuz crisis replay
              </strong>

              <span>
                Select a date to observe how disruption
                risk changes.
              </span>
            </div>

            <div className="command-timeline-current-event">
              {selectedEventName}
            </div>
          </div>

          <div className="command-timeline-track">
            {TIMELINE_DATES.map((item, index) => (
              <button
                type="button"
                key={item.date}
                className={`command-timeline-button ${
                  index === currentDateIndex
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  setCurrentDateIndex(index)
                }
              >
                <span>{item.label}</span>
                <small>{item.event}</small>
              </button>
            ))}
          </div>
        </section>

        <div className="command-content">
          {loading && !networkState ? (
            <div className="command-loading-panel">
              <span className="command-loading-ring" />
              Analysing India&apos;s energy supply
              network...
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeSection === 'overview' && (
                <motion.section
                  className="command-page"
                  key="overview"
                  initial={{
                    opacity: 0,
                    y: 16
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -10
                  }}
                >
                  <PageHeader
                    eyebrow="National energy security"
                    title="Executive Overview"
                    description="A clear view of the selected crisis state, its impact on India and the next recommended decision."
                  />

                  <div className="command-metrics-grid">
                    <MetricCard
                      label="National risk score"
                      value={`${nationalRiskScore}/100`}
                      unit={
                        networkState?.national_risk_level ||
                        'Calculating'
                      }
                      tone={getRiskClass(
                        nationalRiskScore
                      )}
                    />

                    <MetricCard
                      label="Imports affected"
                      value={`${
                        networkState?.volume_affected_pct ??
                        0
                      }%`}
                      unit="of monitored import volume"
                      tone={
                        Number(
                          networkState?.volume_affected_pct ||
                            0
                        ) > 0
                          ? 'warning'
                          : 'stable'
                      }
                    />

                    <MetricCard
                      label="Brent crude"
                      value={`$${
                        networkState?.brent_price ??
                        '--'
                      }`}
                      unit="US dollars per barrel"
                    />

                    <MetricCard
                      label="Highest route risk"
                      value={
                        highestRiskRoute
                          ? `${highestRiskRoute[1].combined_score}/100`
                          : '--'
                      }
                      unit={
                        highestRiskRoute
                          ? formatRouteName(
                              highestRiskRoute[0]
                            )
                          : 'Loading route data'
                      }
                      tone={
                        highestRiskRoute
                          ? getRiskClass(
                              Number(
                                highestRiskRoute[1]
                                  .combined_score
                              )
                            )
                          : 'default'
                      }
                    />
                  </div>

                  <div className="overview-intelligence-grid">
                    <motion.article
                      className="overview-status-card"
                      initial={{
                        opacity: 0,
                        x: -16
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                    >
                      <div className="overview-card-label">
                        Situation assessment
                      </div>

                      <div className="overview-status-heading">
                        <span
                          className={`overview-status-icon ${getRiskClass(
                            nationalRiskScore
                          )}`}
                        />

                        <div>
                          <h2>
                            {riskNarrative.headline}
                          </h2>

                          <p>
                            {
                              riskNarrative.explanation
                            }
                          </p>
                        </div>
                      </div>

                      <div className="overview-event-detail">
                        <div>
                          <small>
                            Selected event
                          </small>

                          <strong>
                            {selectedEventName}
                          </strong>
                        </div>

                        <div>
                          <small>Source</small>

                          <strong>
                            {selectedEventSource}
                          </strong>
                        </div>

                        <div>
                          <small>
                            Safest monitored route
                          </small>

                          <strong>
                            {safestRoute
                              ? formatRouteName(
                                  safestRoute[0]
                                )
                              : 'Loading'}
                          </strong>
                        </div>
                      </div>
                    </motion.article>

                    <motion.article
                      className="overview-action-card"
                      initial={{
                        opacity: 0,
                        x: 16
                      }}
                      animate={{
                        opacity: 1,
                        x: 0
                      }}
                    >
                      <div className="overview-card-label">
                        Recommended response
                      </div>

                      <div className="overview-action-number">
                        01
                      </div>

                      <h2>{riskNarrative.action}</h2>

                      <p>
                        This guidance is generated from
                        the selected timeline state and
                        the computed route-risk model.
                      </p>

                      <div className="overview-action-buttons">
                        <button
                          type="button"
                          className="command-primary-button"
                          onClick={() =>
                            setActiveSection('map')
                          }
                        >
                          Explore risk map
                          <span>→</span>
                        </button>

                        <button
                          type="button"
                          className="command-secondary-button"
                          onClick={() =>
                            setActiveSection(
                              'simulation'
                            )
                          }
                        >
                          Run simulation
                        </button>
                      </div>
                    </motion.article>
                  </div>

                  <div className="overview-route-section">
                    <div className="overview-section-heading">
                      <div>
                        <span>
                          Route intelligence
                        </span>

                        <h2>
                          Priority corridors
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveSection('map')
                        }
                      >
                        View all routes →
                      </button>
                    </div>

                    <div className="overview-route-grid">
                      {sortedRoutes
                        .slice(0, 3)
                        .map(
                          ([
                            routeId,
                            routeData
                          ]) => (
                            <motion.article
                              className="overview-route-card"
                              key={routeId}
                              whileHover={{
                                y: -4
                              }}
                            >
                              <div className="overview-route-card-top">
                                <span
                                  className="overview-route-dot"
                                  style={{
                                    backgroundColor:
                                      getRiskColor(
                                        Number(
                                          routeData.combined_score
                                        )
                                      )
                                  }}
                                />

                                <span>
                                  {routeData.level}
                                </span>
                              </div>

                              <h3>
                                {formatRouteName(
                                  routeId
                                )}
                              </h3>

                              <div
                                className="overview-route-score"
                                style={{
                                  color:
                                    getRiskColor(
                                      Number(
                                        routeData.combined_score
                                      )
                                    )
                                }}
                              >
                                {
                                  routeData.combined_score
                                }

                                <small>
                                  /100
                                </small>
                              </div>

                              <p>
                                {
                                  routeData.explanation
                                }
                              </p>

                              <div className="overview-route-confidence">
                                Confidence:{' '}
                                {
                                  routeData.confidence_pct
                                }
                                %
                              </div>
                            </motion.article>
                          )
                        )}
                    </div>
                  </div>
                </motion.section>
              )}

              {activeSection === 'map' && (
                <motion.section
                  className="command-page"
                  key="map"
                  initial={{
                    opacity: 0,
                    y: 16
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -10
                  }}
                >
                  <PageHeader
                    eyebrow="Geospatial intelligence"
                    title="Energy Corridor Risk Map"
                    description="Visualise how geopolitical and logistics risk affects India’s major energy import corridors for the selected timeline date."
                  />

                  <CorridorMap
                    networkState={networkState}
                    onOpenSimulation={() =>
                      setActiveSection(
                        'simulation'
                      )
                    }
                  />

                  <div className="route-details-grid">
                    {routeEntries.map(
                      ([routeId, routeData]) => {
                        const score =
                          Number(
                            routeData.combined_score
                          ) || 0

                        return (
                          <motion.article
                            className="route-detail-card"
                            key={routeId}
                            whileHover={{
                              y: -4
                            }}
                          >
                            <div className="route-detail-heading">
                              <div>
                                <span
                                  className="route-detail-dot"
                                  style={{
                                    backgroundColor:
                                      getRiskColor(
                                        score
                                      )
                                  }}
                                />

                                <strong>
                                  {formatRouteName(
                                    routeId
                                  )}
                                </strong>
                              </div>

                              <span
                                style={{
                                  color:
                                    getRiskColor(
                                      score
                                    )
                                }}
                              >
                                {score}/100
                              </span>
                            </div>

                            <p>
                              {
                                routeData.explanation
                              }
                            </p>

                            <div className="route-detail-footer">
                              <span>
                                {routeData.level}
                              </span>

                              <span>
                                Confidence{' '}
                                {
                                  routeData.confidence_pct
                                }
                                %
                              </span>
                            </div>
                          </motion.article>
                        )
                      }
                    )}
                  </div>
                </motion.section>
              )}

              {activeSection ===
                'simulation' && (
                <motion.section
                  className="command-page"
                  key="simulation"
                  initial={{
                    opacity: 0,
                    y: 16
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -10
                  }}
                >
                  <PageHeader
                    eyebrow="Scenario intelligence"
                    title="Disruption Simulator"
                    description="Test energy disruptions and estimate supply loss, cost impact, reserve requirements and safer alternatives."
                  />

                  <div className="simulation-layout">
                    <div className="simulation-scenario-panel">
                      <div className="simulation-panel-label">
                        Select a disruption
                      </div>

                      <div className="simulation-scenario-grid">
                        <button
                          type="button"
                          className="simulation-scenario-button critical"
                          onClick={() =>
                            handleSimulate(
                              ['hormuz'],
                              30,
                              'Hormuz Closure — 30 Days'
                            )
                          }
                        >
                          <span>01</span>

                          <strong>
                            Hormuz closure
                          </strong>

                          <small>
                            30-day disruption
                          </small>
                        </button>

                        <button
                          type="button"
                          className="simulation-scenario-button critical"
                          onClick={() =>
                            handleSimulate(
                              [
                                'hormuz',
                                'saudi_pipeline'
                              ],
                              30,
                              'Hormuz + Saudi Pipeline'
                            )
                          }
                        >
                          <span>02</span>

                          <strong>
                            Hormuz + Saudi pipeline
                          </strong>

                          <small>
                            30-day disruption
                          </small>
                        </button>

                        <button
                          type="button"
                          className="simulation-scenario-button elevated"
                          onClick={() =>
                            handleSimulate(
                              ['red_sea'],
                              45,
                              'Red Sea Suspension — 45 Days'
                            )
                          }
                        >
                          <span>03</span>

                          <strong>
                            Red Sea suspension
                          </strong>

                          <small>
                            45-day disruption
                          </small>
                        </button>

                        <button
                          type="button"
                          className="simulation-scenario-button critical"
                          onClick={() =>
                            handleSimulate(
                              [
                                'hormuz',
                                'saudi_pipeline',
                                'fujairah_bypass'
                              ],
                              60,
                              'All Gulf Routes — 60 Days'
                            )
                          }
                        >
                          <span>04</span>

                          <strong>
                            All Gulf routes blocked
                          </strong>

                          <small>
                            60-day disruption
                          </small>
                        </button>
                      </div>
                    </div>

                    <div className="simulation-context-panel">
                      <div className="simulation-panel-label">
                        Selected timeline context
                      </div>

                      <div className="simulation-context-metric">
                        <span>
                          National risk
                        </span>

                        <strong>
                          {nationalRiskScore}/100
                        </strong>
                      </div>

                      <div className="simulation-context-metric">
                        <span>
                          Brent crude
                        </span>

                        <strong>
                          $
                          {networkState?.brent_price ??
                            '--'}
                        </strong>
                      </div>

                      <div className="simulation-context-metric">
                        <span>
                          Volume affected
                        </span>

                        <strong>
                          {networkState?.volume_affected_pct ??
                            0}
                          %
                        </strong>
                      </div>

                      <p>
                        Select a scenario to generate
                        an impact assessment and
                        alternative procurement
                        options.
                      </p>
                    </div>
                  </div>

                  {simLoading && (
                    <div className="command-loading-panel">
                      <span className="command-loading-ring" />
                      Running disruption
                      simulation...
                    </div>
                  )}

                  {simResult && (
                    <motion.div
                      className="simulation-results"
                      initial={{
                        opacity: 0,
                        y: 18
                      }}
                      animate={{
                        opacity: 1,
                        y: 0
                      }}
                    >
                      <div className="simulation-results-heading">
                        <div>
                          <span>
                            Simulation result
                          </span>

                          <h2>
                            {simResult.scenario
                              ?.label ||
                              'Disruption scenario'}
                          </h2>
                        </div>

                        <div
                          className={`simulation-alert-badge ${
                            simResult.alert_level?.toLowerCase() ||
                            ''
                          }`}
                        >
                          {simResult.alert_level}
                        </div>
                      </div>

                      <div className="simulation-results-grid">
                        <MetricCard
                          label="Supply reduction"
                          value={`${simResult.supply_reduction_pct}%`}
                          unit="estimated import loss"
                          tone="critical"
                        />

                        <MetricCard
                          label="Cost impact"
                          value={`$${simResult.cost_impact_billion_usd}B`}
                          unit="estimated financial impact"
                          tone="warning"
                        />

                        <MetricCard
                          label="Survival period"
                          value={
                            simResult.survival_days
                          }
                          unit="estimated days"
                        />

                        <MetricCard
                          label="SPR drawdown"
                          value={
                            simResult.recommended_spr_drawdown_days
                          }
                          unit="recommended days"
                        />
                      </div>

                      {simResult.cost_formula && (
                        <div className="simulation-formula">
                          <span>
                            Calculation
                          </span>

                          <strong>
                            {
                              simResult.cost_formula
                            }
                          </strong>
                        </div>
                      )}

                      {simResult.historical_analog
                        ?.found && (
                        <div className="simulation-analogue">
                          <div className="simulation-analogue-label">
                            Crisis memory engine
                          </div>

                          <h3>
                            Similar to{' '}
                            {
                              simResult
                                .historical_analog
                                .analog_event
                            }
                          </h3>

                          <p>
                            {
                              simResult
                                .historical_analog
                                .historical_outcome
                            }
                          </p>
                        </div>
                      )}

                      <button
                        type="button"
                        className="command-primary-button"
                        onClick={() =>
                          setActiveSection(
                            'recommendations'
                          )
                        }
                      >
                        View procurement
                        recommendations
                        <span>→</span>
                      </button>
                    </motion.div>
                  )}
                </motion.section>
              )}

              {activeSection ===
                'recommendations' && (
                <motion.section
                  className="command-page"
                  key="recommendations"
                  initial={{
                    opacity: 0,
                    y: 16
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -10
                  }}
                >
                  <PageHeader
                    eyebrow="Decision orchestration"
                    title="Procurement Recommendations"
                    description="Convert disruption intelligence into clear and actionable supply-chain decisions."
                  />

                  {!simResult ? (
                    <div className="recommendation-empty-state">
                      <div className="recommendation-empty-number">
                        01
                      </div>

                      <div>
                        <h2>
                          Run a scenario first
                        </h2>

                        <p>
                          Procurement alternatives
                          are generated from a selected
                          disruption scenario. Run the
                          simulator to calculate
                          affected volume, reserve
                          requirements and safer
                          routes.
                        </p>

                        <button
                          type="button"
                          className="command-primary-button"
                          onClick={() =>
                            setActiveSection(
                              'simulation'
                            )
                          }
                        >
                          Open disruption simulator
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="recommendation-summary">
                        <div>
                          <span>
                            Active scenario
                          </span>

                          <h2>
                            {simResult.scenario
                              ?.label ||
                              'Disruption scenario'}
                          </h2>
                        </div>

                        <div className="recommendation-summary-metrics">
                          <div>
                            <small>
                              Supply loss
                            </small>

                            <strong>
                              {
                                simResult.supply_reduction_pct
                              }
                              %
                            </strong>
                          </div>

                          <div>
                            <small>
                              Survival
                            </small>

                            <strong>
                              {
                                simResult.survival_days
                              }{' '}
                              days
                            </strong>
                          </div>

                          <div>
                            <small>
                              Alert level
                            </small>

                            <strong>
                              {
                                simResult.alert_level
                              }
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="recommendation-plan-grid">
                        {simResult.safe_alternatives
                          ?.length > 0 ? (
                          simResult.safe_alternatives.map(
                            (
                              alternative,
                              index
                            ) => (
                              <motion.article
                                className="recommendation-card"
                                key={`${alternative.name}-${index}`}
                                whileHover={{
                                  y: -5
                                }}
                              >
                                <div className="recommendation-card-top">
                                  <span className="recommendation-rank">
                                    {String(
                                      index + 1
                                    ).padStart(
                                      2,
                                      '0'
                                    )}
                                  </span>

                                  <span className="recommendation-flag">
                                    {getCountryFlag(
                                      alternative.name
                                    )}
                                  </span>
                                </div>

                                <h3>
                                  {
                                    alternative.name
                                  }
                                </h3>

                                <div className="recommendation-route">
                                  <small>
                                    Recommended route
                                  </small>

                                  <strong>
                                    {Array.isArray(
                                      alternative.via_routes
                                    )
                                      ? alternative.via_routes
                                          .map(route =>
                                            formatRouteName(
                                              route
                                            )
                                          )
                                          .join(' → ')
                                      : 'Route information unavailable'}
                                  </strong>
                                </div>

                                <div className="recommendation-confidence">
                                  <span>
                                    Confidence
                                  </span>

                                  <strong>
                                    {
                                      alternative.confidence_pct
                                    }
                                    %
                                  </strong>
                                </div>

                                <div className="recommendation-progress">
                                  <span
                                    style={{
                                      width: `${Math.min(
                                        Number(
                                          alternative.confidence_pct
                                        ) || 0,
                                        100
                                      )}%`
                                    }}
                                  />
                                </div>
                              </motion.article>
                            )
                          )
                        ) : (
                          <div className="recommendation-no-data">
                            The backend did not return
                            alternative suppliers for
                            this scenario.
                          </div>
                        )}
                      </div>

                      <div className="decision-sequence">
                        <div>
                          <span>01</span>
                          <strong>Detect</strong>
                          <p>
                            Identify the affected
                            corridor and severity.
                          </p>
                        </div>

                        <div>
                          <span>02</span>
                          <strong>Simulate</strong>
                          <p>
                            Calculate supply, cost and
                            reserve impact.
                          </p>
                        </div>

                        <div>
                          <span>03</span>
                          <strong>Reroute</strong>
                          <p>
                            Select safer suppliers and
                            corridors.
                          </p>
                        </div>

                        <div>
                          <span>04</span>
                          <strong>Monitor</strong>
                          <p>
                            Track risk as geopolitical
                            conditions evolve.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </motion.section>
              )}

              {activeSection === 'ai' && (
                <motion.section
                  className="command-page"
                  key="ai"
                  initial={{
                    opacity: 0,
                    y: 16
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    y: -10
                  }}
                >
                  <PageHeader
                    eyebrow="Conversational intelligence"
                    title="Suraksha AI Copilot"
                    description="Ask questions about route risk, disruption impact, procurement strategy and the selected timeline date."
                  />

                  <div className="copilot-layout">
                    <div className="copilot-chat-panel">
                      <div className="copilot-messages">
                        {chatMessages.map(
                          (message, index) => (
                            <motion.div
                              className={`copilot-message ${message.role}`}
                              key={`${message.role}-${index}`}
                              initial={{
                                opacity: 0,
                                y: 8
                              }}
                              animate={{
                                opacity: 1,
                                y: 0
                              }}
                            >
                              <div className="copilot-message-role">
                                {message.role ===
                                'ai'
                                  ? 'SURAKSHA AI'
                                  : 'YOU'}
                              </div>

                              <div className="copilot-message-bubble">
                                {message.text}
                              </div>
                            </motion.div>
                          )
                        )}

                        {chatLoading && (
                          <div className="copilot-message ai">
                            <div className="copilot-message-role">
                              SURAKSHA AI
                            </div>

                            <div className="copilot-message-bubble loading">
                              Analysing selected
                              timeline and supply-chain
                              data...
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="copilot-input-row">
                        <input
                          value={chatInput}
                          onChange={event =>
                            setChatInput(
                              event.target.value
                            )
                          }
                          onKeyDown={event => {
                            if (
                              event.key ===
                              'Enter'
                            ) {
                              handleChat()
                            }
                          }}
                          placeholder="Ask about the selected crisis timeline..."
                        />

                        <button
                          type="button"
                          onClick={handleChat}
                          disabled={chatLoading}
                        >
                          Send
                          <span>→</span>
                        </button>
                      </div>
                    </div>

                    <aside className="copilot-question-panel">
                      <div className="copilot-question-label">
                        Suggested questions
                      </div>

                      {[
                        'What is the national risk level for this selected date?',
                        'Which supply route is safest for this selected date?',
                        'Why is Hormuz important to India?',
                        'What action should procurement teams take?',
                        'How long can India manage this disruption?',
                        'Which alternative suppliers should be considered?'
                      ].map(question => (
                        <button
                          type="button"
                          key={question}
                          onClick={() =>
                            setChatInput(question)
                          }
                        >
                          {question}
                          <span>+</span>
                        </button>
                      ))}
                    </aside>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>
    </motion.div>
  )
}