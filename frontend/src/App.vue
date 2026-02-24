<template>
  <div class="sticky-logo-container">
    <a href="#" @click.prevent="scrollToTop" class="logo-link">
      <img src="./assets/seal.png" alt="Witcher Logo" class="sticky-logo">
    </a>
  </div>

  <div class="witcher-theme">
    <header class="hero">
      <div class="hero-overlay">
        <div class="portrait-frame">
          <img src="./assets/PIC.jpg" class="profile-img">
        </div>
        <h1 class="glow-text">CRISTIAN R. SALDUA</h1>
        <div class="title-divider"></div>
        <p class="subtitle">IT STUDENT • ASPIRING FULL-STACK DEVELOPER</p>
      </div>
    </header>

    <section class="cinematic-landscape-section">
      <main class="path-container">
        <nav class="tab-nav">
  <div class="tab-scroll-container">
    <button class="tab-btn" :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">ATTRIBUTES</button>
    <button class="tab-btn" :class="{ active: activeTab === 'journal' }" @click="activeTab = 'journal'">JOURNAL</button>
    <button class="tab-btn" :class="{ active: activeTab === 'bestiary' }" @click="activeTab = 'bestiary'">BESTIARY</button>
    <button class="tab-btn" :class="{ active: activeTab === 'alchemy' }" @click="activeTab = 'alchemy'">ALCHEMY</button>
    <button class="tab-btn" :class="{ active: activeTab === 'worldmap' }" @click="activeTab = 'worldmap'">MAP</button>
    <button class="tab-btn" :class="{ active: activeTab === 'gwent' }" @click="activeTab = 'gwent'">GWENT</button>
  </div>
</nav>

        <section class="hub-content">

          <div v-if="activeTab === 'stats'" class="stats-card">
            <h3 class="panel-header">CHARACTER ATTRIBUTES</h3>

            <div class="attr-row" v-for="stat in techStats" :key="stat.label">
              <div class="label-row">
                <span>{{ stat.label }}</span>
                <span class="stat-value-label">{{ stat.value }}%</span>
              </div>
              <div class="slider-track-wrapper">
                <input
                  type="range"
                  min="0"
                  max="100"
                  v-model.number="stat.value" 
                  class="witcher-slider"
                  @input="onStatChange"
                />
                <div class="progress-bar-container">
                  <div class="progress-bar-fill" :style="{ width: stat.value + '%' }"></div>
                </div>
              </div>
            </div>
          

            <div class="combat-arena">
              <div class="arena-header">
                <span class="arena-title-deco">⚔</span>
                <h4 class="arena-title">COMBAT ARENA</h4>
                <span class="arena-title-deco">⚔</span>
              </div>

              <div class="monster-selector" v-if="!combatActive">
                <p class="selector-label">SELECT YOUR QUARRY:</p>
                <div class="difficulty-badge" :class="difficultyClass">
                  ☠ DIFFICULTY: {{ difficultyLabel }} — Monster Power ×{{ difficultyMultiplier.toFixed(1) }}
                </div>
                <div class="quarry-grid">
                  <div
                    v-for="m in scaledMonsters"
                    :key="m.name"
                    class="quarry-card"
                    :class="{ 'quarry-selected': selectedMonster?.name === m.name }"
                    @click="selectMonster(m)"
                  >
                    <div class="quarry-icon">{{ m.icon }}</div>
                    <div class="quarry-name">{{ m.name }}</div>
                    <div class="quarry-hp-label">HP: {{ m.maxHp }}</div>
                    <div class="quarry-atk-label">⚔ ATK: {{ m.attackPower }}</div>
                  </div>
                </div>
                <button class="btn-engage" :disabled="!selectedMonster" @click="startCombat">
                  ⚔ ENGAGE QUARRY
                </button>
              </div>

              <div class="combat-field" v-if="combatActive">
                <div class="player-hp-bar-wrapper">
                  <div class="player-hp-label-row">
                    <span>⚔ WITCHER HP</span>
                    <span :class="{ 'red-text': playerHp < playerMaxHp * 0.3 }">{{ Math.max(0, playerHp) }} / {{ playerMaxHp }}</span>
                  </div>
                  <div class="player-hp-track" :class="{ 'shake': playerHitFlash }">
                    <div
                      class="player-hp-fill"
                      :style="{ width: Math.max(0, (playerHp / playerMaxHp) * 100) + '%' }"
                      :class="playerHpColorClass"
                    ></div>
                  </div>
                </div>

                <div class="monster-display" :class="{ 'monster-hit': monsterHitFlash, 'monster-dead': monsterHp <= 0 }">
                  <div class="monster-icon-large">{{ currentMonster.icon }}</div>
                  <div class="monster-combat-name">{{ currentMonster.name }}</div>
                  <div class="monster-status-line" v-if="monsterHp > 0">{{ currentMonster.taunt }}</div>
                  <div class="monster-status-line defeated-text" v-else>☠ SLAIN ☠</div>

                  <div class="monster-hp-wrapper">
                    <div class="hp-label-row">
                      <span>HP</span>
                      <span>{{ Math.max(0, monsterHp) }} / {{ currentMonster.maxHp }}</span>
                    </div>
                    <div class="monster-hp-track">
                      <div
                        class="monster-hp-fill"
                        :style="{ width: Math.max(0, (monsterHp / currentMonster.maxHp) * 100) + '%' }"
                        :class="hpColorClass"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="attack-power-display">
                  <div class="ap-label">⚡ TOTAL ATTACK POWER</div>
                  <div class="ap-value">{{ totalAttackPower }}</div>
                  <div class="ap-hint">Adjust your attribute sliders above to strengthen your strike</div>
                </div>

                <div class="combat-log" v-if="combatLog.length">
                  <div v-for="(entry, i) in combatLog.slice(-4)" :key="i" class="log-entry" :class="entry.type">
                    {{ entry.text }}
                  </div>
                </div>

                <div class="combat-buttons">
                  <button class="btn-strike" :disabled="monsterHp <= 0 || playerHp <= 0" @click="strikeMonster">⚔ STRIKE</button>
                  <button class="btn-critical" :disabled="monsterHp <= 0 || critCooldown > 0 || playerHp <= 0" @click="criticalStrike">
                    {{ critCooldown > 0 ? `REND (${critCooldown})` : '🔥 REND' }}
                  </button>
                  <button class="btn-dodge" :disabled="monsterHp <= 0 || dodgeCooldown > 0 || playerHp <= 0" @click="dodge">
                    {{ dodgeCooldown > 0 ? `DODGE (${dodgeCooldown})` : '💨 DODGE' }}
                  </button>
                  <button class="btn-retreat" @click="resetCombat">↩ RETREAT</button>
                </div>

                <div class="victory-screen" v-if="monsterHp <= 0">
                  <div class="victory-title">MONSTER SLAIN</div>
                  <div class="victory-reward">+ {{ currentMonster.xp }} XP EARNED</div>
                  <div class="victory-quote">"{{ currentMonster.deathQuote }}"</div>
                  <button class="btn-new-hunt" @click="resetCombat">⚔ NEW HUNT</button>
                </div>
              </div>
            </div>
          </div>

       <div v-if="activeTab === 'journal'" class="bio-card">
  <h3 class="panel-header">THE JOURNAL</h3>
  
  <div class="journal-layout">
    <div class="journal-main">
      <p class="journal-quote">"A witcher's life is written in the blood of monsters and the ink of scholars."</p>
      <div class="journal-entry-text">
        <p>Currently navigating my second year at the <span class="gold-text">Asia Pacific College</span> School of IT. I specialize in transmuting raw logic into elegant digital experiences, bridging the gap between ancient backend structures and modern frontend sorcery.</p>
        
        <div class="academic-box">
          <h4 class="mini-header gold-text">📜 SCHOLARLY BACKGROUND</h4>
          <ul class="edu-list">
            <li><strong>BSIT</strong> | Asia Pacific College (2nd Year)</li>
            <li><strong>STEM-IT</strong> | Asia Pacific College</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="journal-sidebar">
      <div class="sidebar-block">
        <h4 class="mini-header gold-text">👤 WITCHER PROFILE</h4>
        <div class="profile-stat"><strong>NAME:</strong> Cristian R. Saldua</div>
        <div class="profile-stat"><strong>BORN:</strong> October, 2005 (Age 20)</div>
        
      </div>

      <div class="sidebar-block">
        <h4 class="mini-header gold-text">⚔️ COMPLETED CONTRACTS</h4>
        <ul class="quest-list">
          <li><span class="red-text">✔</span> WebProg Finals</li>
          <li><span class="red-text">✔</span> Library Management System</li>
          <li><span class="red-text">✔</span> Smart Parking Prototype</li>
        </ul>
      </div>
    </div>
  </div>
</div>

          <div v-if="activeTab === 'bestiary'" class="bio-card">
            <h3 class="panel-header">BESTIARY OF WORKS</h3>
            <div class="bestiary-grid">
              <div v-for="monster in scaledMonsters" :key="monster.name" class="monster-entry">
                <div class="monster-header">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.5rem;">{{ monster.icon }}</span>
                    <h4 class="monster-title">{{ monster.name }}</h4>
                  </div>
                  <span class="difficulty-badge" :class="monster.threatClass">
                    {{ monster.difficulty }}
                  </span>
                </div>
                <p class="monster-desc">{{ monster.desc }}</p>
                
                <div class="monster-stats-row">
                  <div class="stat-item">
                    <span class="stat-label">TECH HP</span>
                    <span class="stat-value">{{ monster.maxHp }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">DIFFICULTY</span>
                    <span class="stat-value">{{ (monster.attackPower / 10).toFixed(1) }}</span>
                  </div>
                </div>

                <div class="weakness-tag">CORE STACK: {{ monster.weakness }}</div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'alchemy'" class="bio-card">
            <h3 class="panel-header">ALCHEMY & CRAFTING</h3>
            <div class="potion-inventory">
              <div class="potion-slot" v-for="potion in alchemyItems" :key="potion.name">
                <div class="potion-info-header">
                  <strong class="potion-name">{{ potion.icon }} {{ potion.name }}</strong>
                  <span class="potency-label">POTENCY: {{ potion.potency }}%</span>
                </div>
                <p class="potion-description">{{ potion.desc }}</p>
                <div class="potion-bar-bg">
                  <div class="potion-bar-fill" :style="{ width: potion.potency + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'worldmap'" class="bio-card text-center">
            <h3 class="panel-header">THE PATH</h3>
            <div class="map-container">
              <p class="region-label">📍 REGION: <span class="gold-text">ASIA PACIFIC COLLEGE (APC - 2nd Year)</span></p>
              <div class="quest-progress-wrapper">
                <div class="quest-status-row">
                  <span>QUEST PROGRESS</span>
                  <span class="red-text">50% COMPLETE</span>
                </div>
                <div class="quest-bar-bg">
                  <div class="quest-bar-fill"></div>
                </div>
              </div>
              <div class="objective-box">
                <strong class="objective-title">🏆 CURRENT OBJECTIVE: THE GRAND HARVEST</strong>
                <p class="objective-desc">At the School of IT, I’m continuously taking on challenges that help me improve my skills and gain practical experience. Each step is helping me grow and prepare for future opportunities in the field.</p>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'gwent'" class="bio-card text-center">
            <h3 class="panel-header">CARE FOR A ROUND?</h3>
            <p style="margin-bottom: 25px;">The deck is shuffled. Select a card to open a portal.</p>
            <div class="gwent-deck">
              <a href="https://github.com/CrSaldua" target="_blank" class="gwent-card-link">
                <div class="gwent-card-inner">
                  <div class="card-power">10</div>
                  <div class="card-title">GITHUB</div>
                  <div class="card-faction">SCRIBE</div>
                </div>
              </a>
              <a href="https://www.linkedin.com/feed/" target="_blank" class="gwent-card-link">
                <div class="gwent-card-inner linkedin">
                  <div class="card-power">12</div>
                  <div class="card-title">LINKEDIN</div>
                  <div class="card-faction">RECRUIT</div>
                </div>
              </a>
              <a href="https://www.facebook.com/" target="_blank" class="gwent-card-link">
                <div class="gwent-card-inner facebook">
                  <div class="card-power">08</div>
                  <div class="card-title">FACEBOOK</div>
                  <div class="card-faction">SOCIAL</div>
                </div>
              </a>
              <a href="https://www.instagram.com/iittiannn/" target="_blank" class="gwent-card-link">
                <div class="gwent-card-inner instagram">
                  <div class="card-power">09</div>
                  <div class="card-title">INSTAGRAM</div>
                  <div class="card-faction">GALLERY</div>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>
    </section>

    <section class="team-selection-section">
      <div class="ornate-title-group">
        <h2 class="meet-team-title">The School</h2>
      </div>

 <div class="carousel-container">
  <button class="nav-arrow" @click="prevMember">
    <div class="arrow-circle">‹</div>
  </button>

  <div class="carousel-track-wrapper">
    <div 
      class="carousel-track" 
      :style="{ transform: `translateX(calc(50% - 90px - (${currentMemberIndex} * 200px)))` }"
    >
      <div 
        v-for="(member, index) in teamMembers" 
        :key="member.name" 
        class="team-card" 
        :class="{ 'active-team': currentMemberIndex === index }" 
        @click="currentMemberIndex = index"
      >
        <div class="frame-border">
          <div class="card-img-wrapper">
            <div class="card-img" :style="{ backgroundImage: 'url(' + member.img + ')' }"></div>
            <div class="scanline-effect"></div>
            <div class="skill-rune-tag">{{ member.rune }}</div>
          </div>
        </div>
        <div class="card-label-btn">{{ member.name }}</div>
      </div>
    </div>
  </div>

  <button class="nav-arrow" @click="nextMember">
    <div class="arrow-circle">›</div>
  </button>
</div>

      <transition name="fade-panel" mode="out-in">
        <div :key="currentMemberIndex" class="ornate-bio-panel">
          <div class="corner tl"></div><div class="corner tr"></div>
          <div class="corner bl"></div><div class="corner br"></div>
          <h3 class="panel-spec-title">{{ teamMembers[currentMemberIndex].role }}</h3>
          <p class="panel-quote">"{{ teamMembers[currentMemberIndex].quote }}"</p>
          <div class="panel-divider-small"></div>
          <p class="panel-desc-text">{{ teamMembers[currentMemberIndex].desc }}</p>
        </div>
      </transition>
    </section>

    <div class="section-divider"></div>

    <section id="contact" class="notice-board">
      <div class="board-wrapper">
        <h3 class="panel-header" style="margin-bottom: 40px;">NOTICE BOARD</h3>

        <div class="contract-form">
          <h3 class="panel-header" style="border:none; font-size: 1.2rem;">POST A CONTRACT</h3>
          <form @submit.prevent="postContract">
            <input v-model="newContract.name" placeholder="CLIENT NAME" required />
            <textarea v-model="newContract.message" rows="4" placeholder="DESCRIBE THE CONTRACT..." required></textarea>
            <button type="submit" class="btn-primary">SEAL WITH WAX</button>
          </form>
        </div>
        <div class="contracts-list">
          <div v-for="note in notes" :key="note.id" class="parchment-note">
            <strong>CONTRACT FROM: {{ note.name }}</strong>
            <p>"{{ note.message }}"</p>
            <img src="./assets/wax-seal.png" alt="Official Seal" class="wax-seal-posted">
          </div>
        </div>
      </div>
    </section>

    <footer class="scroll-footer">
  <div class="footer-decoration">
    <div class="footer-line"></div>
    <img src="./assets/seal.png" alt="Witcher Medallion" class="footer-medallion">
    <div class="footer-line"></div>
  </div>
  
  <p class="motto">"No one can hit their target with their eyes closed."</p>
  
  <div class="footer-credits">
    <p class="gold-text cinzel">CRISTIAN R. SALDUA</p>
    <p>© 2026 SALDUA DEVELOPMENT • ASIA PACIFIC COLLEGE</p>
  </div>

  <div class="footer-bottom-bar">
    <span class="red-text">⚔</span> SCHOOL OF IT <span class="red-text">⚔</span>
  </div>
</footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import './style.css'

const activeTab = ref('stats')

// ─── INTERACTIVE STAT SLIDERS ────────────────────────────────
const techStats = ref([
  { label: 'HTML/CSS', value: 90 },
  { label: 'JAVASCRIPT', value: 85 },
  { label: 'PYTHON', value: 70 },
  { label: 'DATABASE', value: 75 }
])

const alchemyItems = [
  { name: 'VUE DECOCTION', potency: 85, icon: '🧪', desc: 'Enhances reactive sight. Essential for crafting complex interactive portals.' },
  { name: 'SUPABASE ELIXIR', potency: 70, icon: '⚗️', desc: 'Provides a steady flow of cloud data. Powers the long-term memory of the Notice Board.' },
  { name: 'THUNDERBOLT API', potency: 90, icon: '⚡', desc: 'Increases processing speed when striking external servers for data retrieval.' }
]

// ─── COMBAT ARENA & BESTIARY DATA ────────────────────────────
const baseMonsters = [
  { 
    name: 'WITCHER JOURNAL FINALS', 
    skill: 'JAVASCRIPT', 
    icon: '⚔️', 
    taunt: 'A NestJS backend and Vue 3 frontend... quite a contract!', 
    deathQuote: 'Vercel deployment... successful...',
    xp: 500,
    counterTaunts: ['REST API calls? A formidable sign!', 'CORS policy... my only weakness!']
  },
  { 
    name: 'SMART PARKING PROTOTYPE', 
    skill: 'PYTHON', 
    icon: '🅿️', 
    taunt: 'Can you handle the IR sensor logic?', 
    deathQuote: 'Parking slot... now available...',
    xp: 450,
    counterTaunts: ['Arduino logic is deeper than you think!', 'Circuit short detected!']
  },
  { 
    // Updated from HappyPaws to Library Management System
    name: 'LIBRARY MANAGEMENT SYSTEM', 
    skill: 'DATABASE', 
    icon: '📚', 
    taunt: 'Unorganized records are a witcher\'s bane!', 
    deathQuote: 'Archived and indexed...',
    xp: 600,
    counterTaunts: ['SQL queries are my strongest signs!', 'Index optimization... complete!']
  },
  { 
    name: 'PROFILE MOBILE APP', 
    skill: 'HTML/CSS', 
    icon: '📱', 
    taunt: 'Responsive design is the ultimate trial.', 
    deathQuote: 'Rendered... flawlessly...',
    xp: 300,
    counterTaunts: ['Flexbox won\'t save you here!', 'Media queries... active!']
  }
]

// ─── DIFFICULTY SCALING ───────────────────────────────────────
const difficultyMultiplier = computed(() => {
  const avg = techStats.value.reduce((sum, s) => sum + s.value, 0) / techStats.value.length
  return +(0.6 + (avg / 100) * 1.6).toFixed(2)
})

const playerMaxHp = computed(() => {
  const avg = techStats.value.reduce((sum, s) => sum + s.value, 0) / techStats.value.length
  return Math.round(80 + (avg / 100) * 120)
})

const difficultyLabel = computed(() => {
  const m = difficultyMultiplier.value
  if (m < 0.9) return 'APPRENTICE'
  if (m < 1.2) return 'JOURNEYMAN'
  if (m < 1.5) return 'VETERAN'
  if (m < 1.8) return 'MASTER'
  return 'LEGENDARY'
})

const difficultyClass = computed(() => {
  const m = difficultyMultiplier.value
  if (m < 0.9) return 'diff-easy'
  if (m < 1.2) return 'diff-normal'
  if (m < 1.5) return 'diff-hard'
  if (m < 1.8) return 'diff-master'
  return 'diff-legendary'
})

const scaledMonsters = computed(() => {
  return baseMonsters.map(m => {
    const skillObj = techStats.value.find(s => s.label === m.skill)
    const skillLevel = skillObj ? skillObj.value : 50
    const hp = Math.round(100 * difficultyMultiplier.value * (skillLevel / 50))
    const attack = Math.round(15 * difficultyMultiplier.value * (skillLevel / 70))
    
    let threat = 'COMMON'
    let tClass = 'diff-normal'
    if (skillLevel > 85) { threat = 'DEADLY'; tClass = 'diff-legendary' }
    else if (skillLevel > 70) { threat = 'GUARDED'; tClass = 'diff-master' }

    return {
      ...m,
      maxHp: hp,
      attackPower: attack,
      difficulty: threat,
      threatClass: tClass,
      desc: getMonsterDesc(m.name),
      weakness: getMonsterWeakness(m.name)
    }
  })
})

function getMonsterDesc(name) {
  const descs = {
    'WITCHER JOURNAL FINALS': 'A full-stack contract involving a NestJS REST API hosted on Vercel and a Vue 3 frontend.',
    'SMART PARKING PROTOTYPE': 'A hardware-software hybrid project using Arduino IR sensors and Python to manage real-time parking availability.',
    'HAPPYPAWS VET CLINIC': 'A complex hybrid database architecture utilizing MySQL for billing and MongoDB for patient medical records.',
    'PROFILE MOBILE APP': 'A Flutter-based mobile application submitted as part of the APPDEV course requirement.'
  }
  return descs[name] || 'A complex academic trial.'
}

function getMonsterWeakness(name) {
  const weaknesses = {
    'WITCHER JOURNAL FINALS': 'NestJS/Vue.js Mastery',
    'SMART PARKING PROTOTYPE': 'Arduino Circuitry & Logic',
    'HAPPYPAWS VET CLINIC': 'Polyglot Persistence (SQL/NoSQL)',
    'PROFILE MOBILE APP': 'Dart & Flutter UI widgets'
  }
  return weaknesses[name] || 'Skill Mastery'
}

const selectedMonster = ref(null)
const currentMonster = ref(null)
const combatActive = ref(false)
const monsterHp = ref(0)
const playerHp = ref(0)
const monsterHitFlash = ref(false)
const playerHitFlash = ref(false)
const combatLog = ref([])
const critCooldown = ref(0)
const dodgeCooldown = ref(0)
const dodgeNextHit = ref(false)

const totalAttackPower = computed(() => {
  const avg = techStats.value.reduce((sum, s) => sum + s.value, 0) / techStats.value.length
  return Math.round(avg)
})

const hpColorClass = computed(() => {
  const pct = (monsterHp.value / (currentMonster.value?.maxHp || 1)) * 100
  if (pct > 60) return 'hp-green'
  if (pct > 30) return 'hp-yellow'
  return 'hp-red'
})

const playerHpColorClass = computed(() => {
  const pct = (playerHp.value / playerMaxHp.value) * 100
  if (pct > 60) return 'hp-green'
  if (pct > 30) return 'hp-yellow'
  return 'hp-red'
})

function onStatChange() {
  if (combatActive.value && monsterHp.value > 0) {
    addLog(`⚡ Attack power shifted to ${totalAttackPower.value}`, 'log-adjust')
  }
}

function selectMonster(m) { selectedMonster.value = m }

function startCombat() {
  currentMonster.value = { ...selectedMonster.value }
  monsterHp.value = currentMonster.value.maxHp
  playerHp.value = playerMaxHp.value
  combatActive.value = true
  combatLog.value = []
  critCooldown.value = 0
  dodgeCooldown.value = 0
  dodgeNextHit.value = false
  addLog(`⚔ Combat begins — ${currentMonster.value.name} has ${currentMonster.value.maxHp} HP`, 'log-system')
}

function calcDamage(multiplier = 1) {
  const base = totalAttackPower.value
  const variance = Math.floor(Math.random() * 15) - 7
  return Math.max(1, Math.round((base * multiplier * 0.4) + variance))
}

function monsterCounterAttack() {
  if (monsterHp.value <= 0 || playerHp.value <= 0) return
  if (Math.random() > 0.8) {
    addLog(`💨 ${currentMonster.value.name} winds up... and misses!`, 'log-dodge')
    return
  }
  if (dodgeNextHit.value) {
    dodgeNextHit.value = false
    addLog(`💨 You evade the monster's strike!`, 'log-dodge')
    return
  }
  const atk = currentMonster.value.attackPower
  const dmg = Math.max(1, atk + Math.floor(Math.random() * 5) - 2)
  playerHp.value = Math.max(0, playerHp.value - dmg)
  playerHitFlash.value = true
  setTimeout(() => { playerHitFlash.value = false }, 350)
  addLog(`💀 ${currentMonster.value.name} retaliates for ${dmg} damage!`, 'log-monster')
}

function strikeMonster() {
  if (monsterHp.value <= 0 || playerHp.value <= 0) return
  const dmg = calcDamage(1)
  monsterHp.value -= dmg
  monsterHitFlash.value = true
  setTimeout(() => { monsterHitFlash.value = false }, 350)
  addLog(`⚔ You strike for ${dmg} damage!`, 'log-hit')
  if (critCooldown.value > 0) critCooldown.value--
  if (dodgeCooldown.value > 0) dodgeCooldown.value--
  if (monsterHp.value <= 0) {
    addLog(`☠ ${currentMonster.value.name} has been slain!`, 'log-victory')
  } else {
    monsterCounterAttack()
  }
}

function criticalStrike() {
  if (monsterHp.value <= 0 || critCooldown.value > 0 || playerHp.value <= 0) return
  const dmg = calcDamage(2.8)
  monsterHp.value -= dmg
  monsterHitFlash.value = true
  setTimeout(() => { monsterHitFlash.value = false }, 350)
  addLog(`🔥 REND! Critical blow for ${dmg} damage!`, 'log-crit')
  critCooldown.value = 3
  if (monsterHp.value > 0) monsterCounterAttack()
}

function dodge() {
  if (monsterHp.value <= 0 || dodgeCooldown.value > 0 || playerHp.value <= 0) return
  dodgeNextHit.value = true
  dodgeCooldown.value = 2
  addLog(`💨 You prepare to dodge the next strike!`, 'log-dodge')
  monsterCounterAttack()
}

function addLog(text, type = 'log-hit') { combatLog.value.push({ text, type }) }

function resetCombat() {
  combatActive.value = false
  currentMonster.value = null
  selectedMonster.value = null
}

const scrollToTop = () => { window.scrollTo({ top: 0, behavior: 'smooth' }) }

const currentMemberIndex = ref(0)
const teamMembers = [
  { name: 'Dom', role: 'LEAD ARCHITECT', rune: '◈', quote: 'Raw logic into elegant digital experiences.', desc: 'Specializes in bridging the gap between ancient backend structures and modern frontend sorcery.', img: new URL('./assets/Dom.png', import.meta.url).href },
  { name: 'Jared', role: 'DATA ALCHEMIST', rune: 'ᛗ', quote: 'The truth is hidden in the patterns.', desc: 'Expert in transmuting disorganized databases into pure gold.', img: new URL('./assets/jared.jpg', import.meta.url).href },
  { name: 'Charles', role: 'SYSTEMS SCOUT', rune: 'ᛘ', quote: 'Secure the perimeter.', desc: 'Maintains infrastructure.', img: new URL('./assets/charles.jpg', import.meta.url).href },
  { name: 'Rap', role: 'NETWORK RANGER', rune: 'ᚠ', quote: 'Connections are the lifelines.', desc: 'Ensures flow of data.', img: new URL('./assets/rap.jpg', import.meta.url).href },
  { name: 'Justine', role: 'FRONTEND WITCHER', rune: 'ᛁ', quote: 'Pixels are my clay.', desc: 'Motion arts specialist.', img: new URL('./assets/justine.jpg', import.meta.url).href }
]
const nextMember = () => { currentMemberIndex.value = (currentMemberIndex.value + 1) % teamMembers.length }
const prevMember = () => { currentMemberIndex.value = (currentMemberIndex.value - 1 + teamMembers.length) % teamMembers.length }

// ... existing imports ...

const notes = ref([])
const newContract = ref({ name: '', message: '' })

// IMPORTANT: Added /guestbook to the end of the URL
const API_URL = 'https://personal-website-finals-ten-dusky.vercel.app/guestbook';

async function fetchNotes() {
  try {
    const response = await fetch(API_URL);
    if (response.ok) {
      notes.value = await response.json();
    } else {
      console.error('Server responded with error:', response.status);
    }
  } catch (error) { 
    console.error('Failed to fetch contracts:', error); 
  }
}

async function postContract() {
  try {
    const response = await fetch(API_URL, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newContract.value.name,
        message: newContract.value.message
      })
    });

    if (response.ok) {
      newContract.value = { name: '', message: '' }; 
      await fetchNotes(); 
    } else {
      const errorData = await response.json();
      console.error('Server Error:', errorData);
    }
  } catch (error) {
    console.error('Witcher Error: Failed to seal contract:', error);
  }
}

onMounted(fetchNotes)
</script>