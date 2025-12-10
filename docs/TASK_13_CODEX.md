# 🏆 TASK #13: Gamification Enhancement - Badges, Achievements & Leaderboard Integration

## 📌 EXECUTIVE SUMMARY

Build complete **Badge Reward System**, **Achievement Tracking**, and **Multi-Dimensional Leaderboards** that turn XP → Skills progression into engaging, competitive gameplay. Players earn badges for milestones, unlock achievements through play, and compete on multiple leaderboards (global, by-skill, trending). This bridges mini-games → progression → social engagement.

**Status:** READY FOR DEVELOPMENT  
**Complexity:** MEDIUM-HIGH (8-10 hours)  
**Dependencies:** TASK #8, #8.5, #9, #10, #11, #12 ✅  

---

## 🎮 GAME MECHANICS

### Badge Framework (3 Tiers × 3 Paths)

```
🎯 PROGRESSION BADGES (Skill-Based)

TIER 1: FOUNDATIONS
├─ 5S Badges
│  ├─ "Sorter" (50 XP in 5S) - Unlock "SORT" skill bonus
│  ├─ "Organizer" (150 XP in 5S)
│  └─ "5S Champion" (500 XP in 5S) - Unlock advanced 5S
│
├─ Problem Solving Badges
│  ├─ "Why Master" (Complete 5 Ishikawa)
│  ├─ "Root Cause Finder" (80+ avg score)
│  └─ "Ishikawa Expert" (20 challenges)
│
└─ Gemba Badges
   ├─ "Observer" (First Gemba walk)
   ├─ "Visual Manager" (5 walks completed)
   └─ "Gemba Master" (50 observations)

TIER 2: MASTERY
├─ "Kaizen Practitioner" (Tier 2 unlock)
├─ "Standard Work Expert" (100 XP in category)
└─ "Process Analyst" (Tier 2 + multiple skills)

TIER 3: MASTERY PINNACLE
├─ "Lean Master" (Tier 3 + 2000 XP)
├─ "Continuous Improver" (All tier 3 skills)
└─ "Enterprise Excellence" (Complete skill tree)

🏅 COMPETITIVE BADGES (Leaderboard-Based)
├─ "Weekly Champion" (Highest XP in week)
├─ "Top 10 Player" (Leaderboard rank ≤ 10)
├─ "Consistent Performer" (Top 50 for 4 weeks)
└─ "Unstoppable" (10-day quest streak)

🎖️ ACHIEVEMENT-LINKED BADGES
├─ "First Step" (Complete 1 quest) → Badge
├─ "Auditor" (5 audits) → Badge
├─ "Teaching Master" (3 learners) → Badge
└─ "Legacy" (30-day active user) → Badge
```

### Achievement Hierarchy

```
✅ MILESTONE ACHIEVEMENTS (Counter-Based)
├─ "First Step"
│  └─ Complete 1 quest (50 XP reward) + "First Step" badge
│
├─ "Auditor" 
│  └─ Complete 5 5S audits (100 XP) + "Auditor" badge
│
├─ "Problem Solver"
│  └─ Complete 10 Ishikawa (150 XP) + "Problem Solver" badge
│
└─ "Audit Master"
   └─ Complete 50 audits (500 XP) + "Master Auditor" badge

🔥 STREAK ACHIEVEMENTS
├─ "On Fire" - 5-day streak (100 XP)
├─ "Unstoppable" - 10-day streak (250 XP + badge)
├─ "Legendary" - 30-day streak (500 XP + badge)
└─ "Immortal" - 60-day streak (1000 XP + title)

🌟 CATEGORY MASTERY ACHIEVEMENTS
├─ "5S Expert" - 500 XP in 5S category
├─ "PS Master" - 500 XP in Problem Solving
├─ "Gemba Walker" - 300+ observations
└─ "Lean Expert" - 2000+ total XP

🎯 SOCIAL ACHIEVEMENTS
├─ "Mentor" - Have 1 learner complete 5 quests
├─ "Coach" - Have 3 learners reach Tier 2
├─ "Team Leader" - 5 team members active
└─ "Teaching Master" - 10 learners in your network
```

### Leaderboard Dimensions

```
1️⃣ GLOBAL LEADERBOARD (All-Time)
┌─────────────────────────────────────────┐
│ Rank │ Name        │ XP    │ Tier │ Badges │
├──────┼─────────────┼───────┼──────┼────────┤
│  1   │ Lean Master │ 2500  │  3   │   15   │
│  2   │ CI Champion │ 2100  │  3   │   12   │
│  3   │ 5S Expert   │ 1800  │  2   │   10   │
└─────────────────────────────────────────┘

2️⃣ BY-SKILL LEADERBOARDS (Specialized)
- "Best 5S Masters" (sorted by 5S XP)
- "Best Problem Solvers" (sorted by PS XP)
- "Best Gemba Walkers" (sorted by observations)

3️⃣ TRENDING (XP/Day Velocity)
┌─────────────────────────────────────────┐
│ Rank │ Name      │ XP/Day │ Trend   │
├──────┼───────────┼────────┼─────────┤
│  1   │ New Player│ 45.5   │ 🔥 up   │
│  2   │ Focused   │ 32.1   │ ↗ rising│
│  3   │ Steady    │ 28.3   │ → stable│
└─────────────────────────────────────────┘

4️⃣ TIME-BASED
- Weekly (Most XP in last 7 days)
- Monthly (Most XP in last 30 days)
- Seasonal (Resets quarterly)

5️⃣ CATEGORY LEADERBOARDS
- By Badge Count
- By Streak Length
- By Achievement Count
```

---

## 🏗️ BACKEND ARCHITECTURE

### Prisma Models (NEW)

```prisma
model Badge {
  id              Int      @id @default(autoincrement())
  code            String   @unique  // "5S_CHAMPION"
  name            String   // "5S Champion"
  description     String   @db.Text
  
  // Visual
  icon            String?  // emoji or URL
  color           String?  // #FF6B6B for CSS
  
  // Unlock Rules
  unlockType      String   // "xp", "achievement", "streak", "leaderboard", "quest_type"
  unlockCondition Json     // {skillCode: "5S", xpRequired: 500}
  
  // Rewards
  xpReward        Int      @default(0)
  skillBonusId    Int?     // Links to SkillTreeNode for bonus
  titleUnlock     String?  // "5S Master" - player title
  
  // Classification
  rarity          String   @default("common") // common, rare, epic, legendary
  category        String   // "5S", "PS", "COMPETITIVE", "SOCIAL"
  tier            Int      @default(1) // Difficulty tier
  
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  userBadges      UserBadge[]
  achievements    Achievement[] @relation("BadgeToAchievement")
  
  @@index([unlockType])
  @@index([category])
  @@index([rarity])
  @@index([tier])
}

model UserBadge {
  id              Int      @id @default(autoincrement())
  userId          Int
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  badgeId         Int
  badge           Badge    @relation(fields: [badgeId], references: [id], onDelete: Cascade)
  
  unlockedAt      DateTime @default(now())
  displayOrder    Int      @default(0) // For showcase
  notified        Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  
  @@unique([userId, badgeId])
  @@index([userId])
  @@index([badgeId])
  @@index([unlockedAt])
}

model Achievement {
  id              Int      @id @default(autoincrement())
  code            String   @unique  // "FIRST_QUEST"
  name            String   // "First Step"
  description     String   @db.Text
  icon            String?
  
  // Progress Tracking
  type            String   // "counter", "milestone", "streak", "social"
  targetValue     Int      // 1, 5, 10, 50, etc.
  trackingField   String   // "quests_completed", "audits_completed", "xp_total", etc.
  
  // Rewards
  xpReward        Int      @default(0)
  badgeId         Int?     // Awards badge on completion
  badge           Badge?   @relation("BadgeToAchievement", fields: [badgeId], references: [id], onDelete: SetNull)
  
  // Difficulty & Category
  difficulty      String   @default("easy") // easy, medium, hard, legendary
  category        String   @default("general") // 5S, PS, STREAKS, SOCIAL, MILESTONE
  hidden          Boolean  @default(false) // Don't show until unlocked
  
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  userAchievements UserAchievement[]
  
  @@index([category])
  @@index([trackingField])
  @@index([difficulty])
}

model UserAchievement {
  id              Int      @id @default(autoincrement())
  userId          Int
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  achievementId   Int
  achievement     Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)
  
  // Progress (0-100%)
  progress        Int      @default(0)
  completedAt     DateTime?
  notified        Boolean  @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([userId, achievementId])
  @@index([userId])
  @@index([achievementId])
  @@index([completedAt])
}

model LeaderboardStats {
  id              Int      @id @default(autoincrement())
  userId          Int      @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Global Ranking
  globalRank      Int?
  globalRankLast  Int? // Previous rank
  
  // Category Ranks
  bestSkillRank   Int?
  bestSkillCode   String? // Which skill ranks best
  
  // Stats
  totalQuestsCompleted Int @default(0)
  totalAuditsCompleted Int @default(0)
  totalProblemsResolved Int @default(0)
  badgeCount      Int      @default(0)
  achievementCount Int     @default(0)
  
  // Streaks
  currentStreak   Int      @default(0)
  maxStreak       Int      @default(0)
  lastQuestDate   DateTime?
  
  // Velocity
  xpPerDay        Float    @default(0.0)
  xpTrend         String   @default("stable") // rising, stable, falling
  momentum        Int      @default(0) // 0-100 score
  
  // Rankings (weekly/monthly)
  weeklyRank      Int?
  monthlyRank     Int?
  
  lastUpdated     DateTime @default(now())
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([globalRank])
  @@index([xpPerDay])
  @@index([currentStreak])
  @@index([weeklyRank])
  @@index([lastUpdated])
}

model PlayerComparison {
  id              Int      @id @default(autoincrement())
  userId1         Int
  user1           User     @relation("Player1", fields: [userId1], references: [id], onDelete: Cascade)
  
  userId2         Int
  user2           User     @relation("Player2", fields: [userId2], references: [id], onDelete: Cascade)
  
  // XP Comparison
  xpDifference    Int
  xpRatio         Float
  
  // Rank Comparison
  rankDifference  Int
  
  // Skill Comparison
  skillsCommon    Int
  skillsUser1Only Int
  skillsUser2Only Int
  
  // Badge Comparison
  badgeDifference Int
  commonBadges    Int
  
  // Meta
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([userId1, userId2])
  @@index([userId1])
  @@index([userId2])
}

// Extend User model:
model User {
  // ... existing fields
  userBadges      UserBadge[]
  userAchievements UserAchievement[]
  leaderboardStats LeaderboardStats?
  comparisonsAs1  PlayerComparison[] @relation("Player1")
  comparisonsAs2  PlayerComparison[] @relation("Player2")
}
```

---

## 🔌 API ROUTES (WITH ERROR HANDLING)

### Badge Endpoints

```typescript
// GET /api/badges
// Returns: All badges + user's unlock status
// Error handling: 401 (auth), 500 (DB)
export async function GET(req: Request) {
  try {
    const user = await auth()
    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401})
    
    const badges = await db.badge.findMany({
      where: { active: true },
      include: {
        userBadges: {
          where: { userId: user.id },
          select: { unlockedAt: true }
        }
      },
      orderBy: [{ tier: 'desc' }, { rarity: 'desc' }]
    })
    
    return NextResponse.json(badges.map(badge => ({
      ...badge,
      isUnlocked: badge.userBadges.length > 0,
      unlockedAt: badge.userBadges[0]?.unlockedAt
    })))
  } catch (error) {
    logger.error('GET /api/badges:', error)
    return NextResponse.json({error: "Failed to fetch badges"}, {status: 500})
  }
}

// GET /api/badges/showcase/:userId
// Returns: User's unlocked badges in display order
export async function GET(req: Request, {params}: {params: {userId: string}}) {
  try {
    const userId = parseInt(params.userId)
    if (isNaN(userId)) {
      return NextResponse.json({error: "Invalid user ID"}, {status: 400})
    }
    
    const badges = await db.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { displayOrder: 'asc' }
    })
    
    return NextResponse.json(badges.map(ub => ({
      ...ub.badge,
      unlockedAt: ub.unlockedAt
    })))
  } catch (error) {
    logger.error('GET /api/badges/showcase:', error)
    return NextResponse.json({error: "Failed to fetch badge showcase"}, {status: 500})
  }
}
```

### Achievement Endpoints

```typescript
// GET /api/achievements
// Returns: All achievements + user's progress
export async function GET(req: Request) {
  try {
    const user = await auth()
    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401})
    
    const achievements = await db.achievement.findMany({
      where: {
        active: true,
        OR: [{ hidden: false }, { hidden: true }] // Show hidden if unlocked
      },
      include: {
        userAchievements: {
          where: { userId: user.id },
          select: { progress: true, completedAt: true }
        }
      },
      orderBy: [{ difficulty: 'asc' }, { category: 'asc' }]
    })
    
    return NextResponse.json(achievements.map(ach => {
      const userAch = ach.userAchievements[0]
      const isUnlocked = userAch?.completedAt !== null
      
      return {
        ...ach,
        userProgress: userAch || { progress: 0, completedAt: null },
        isUnlocked,
        shouldHide: ach.hidden && !isUnlocked
      }
    }))
  } catch (error) {
    logger.error('GET /api/achievements:', error)
    return NextResponse.json({error: "Failed to fetch achievements"}, {status: 500})
  }
}

// GET /api/achievements/:id/progress
// Returns: Detailed progress for single achievement
export async function GET(req: Request, {params}: {params: {id: string}}) {
  try {
    const user = await auth()
    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401})
    
    const achievementId = parseInt(params.id)
    if (isNaN(achievementId)) {
      return NextResponse.json({error: "Invalid achievement ID"}, {status: 400})
    }
    
    const achievement = await db.achievement.findUnique({
      where: { id: achievementId },
      include: {
        userAchievements: {
          where: { userId: user.id }
        }
      }
    })
    
    if (!achievement) {
      return NextResponse.json({error: "Achievement not found"}, {status: 404})
    }
    
    const userAch = achievement.userAchievements[0]
    
    return NextResponse.json({
      ...achievement,
      progress: userAch?.progress || 0,
      completedAt: userAch?.completedAt,
      isCompleted: userAch?.completedAt !== null
    })
  } catch (error) {
    logger.error('GET /api/achievements/:id/progress:', error)
    return NextResponse.json({error: "Failed to fetch progress"}, {status: 500})
  }
}
```

### Leaderboard Endpoints

```typescript
// GET /api/leaderboard/global?page=1&limit=50
// Returns: Global all-time leaderboard
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const skip = (page - 1) * limit
    
    const [total, stats] = await Promise.all([
      db.leaderboardStats.count(),
      db.leaderboardStats.findMany({
        where: { globalRank: { not: null } },
        include: {
          user: { select: { id: true, name: true, email: true } }
        },
        orderBy: { globalRank: 'asc' },
        skip,
        take: limit
      })
    ])
    
    return NextResponse.json({
      data: stats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    logger.error('GET /api/leaderboard/global:', error)
    return NextResponse.json({error: "Failed to fetch leaderboard"}, {status: 500})
  }
}

// GET /api/leaderboard/by-skill/:skillCode?limit=50
// Returns: Leaderboard sorted by specific skill XP
export async function GET(req: Request, {params}: {params: {skillCode: string}}) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    
    const skillCode = params.skillCode
    if (!skillCode.match(/^[A-Z0-9_]+$/)) {
      return NextResponse.json({error: "Invalid skill code"}, {status: 400})
    }
    
    const leaderboard = await db.playerSkill.findMany({
      where: {
        skill: { category: skillCode },
        isUnlocked: true
      },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: [{ skillXp: 'desc' }],
      take: limit
    })
    
    return NextResponse.json(leaderboard.map((entry, idx) => ({
      rank: idx + 1,
      userId: entry.userId,
      userName: entry.user.name,
      skillXp: entry.skillXp,
      masteryLevel: entry.masteryLevel,
      level: entry.level
    })))
  } catch (error) {
    logger.error('GET /api/leaderboard/by-skill:', error)
    return NextResponse.json({error: "Failed to fetch leaderboard"}, {status: 500})
  }
}

// GET /api/leaderboard/trending?limit=20
// Returns: Fastest growing players (XP/day velocity)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    
    const stats = await db.leaderboardStats.findMany({
      where: { lastUpdated: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { xpPerDay: 'desc' },
      take: limit
    })
    
    return NextResponse.json(stats.map((stat, idx) => ({
      rank: idx + 1,
      userId: stat.userId,
      userName: stat.user.name,
      xpPerDay: stat.xpPerDay.toFixed(1),
      trend: stat.xpTrend,
      momentum: stat.momentum,
      maxStreak: stat.maxStreak
    })))
  } catch (error) {
    logger.error('GET /api/leaderboard/trending:', error)
    return NextResponse.json({error: "Failed to fetch trending"}, {status: 500})
  }
}

// GET /api/leaderboard/weekly?limit=50
// Returns: Weekly leaderboard (past 7 days)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    
    const stats = await db.leaderboardStats.findMany({
      where: { weeklyRank: { not: null } },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { weeklyRank: 'asc' },
      take: limit
    })
    
    return NextResponse.json(stats)
  } catch (error) {
    logger.error('GET /api/leaderboard/weekly:', error)
    return NextResponse.json({error: "Failed to fetch weekly leaderboard"}, {status: 500})
  }
}
```

### Comparison Endpoints

```typescript
// GET /api/players/:id1/compare/:id2
// Returns: Player comparison (XP, skills, badges, streaks)
export async function GET(req: Request, {params}: {params: {id1: string, id2: string}}) {
  try {
    const userId1 = parseInt(params.id1)
    const userId2 = parseInt(params.id2)
    
    if (isNaN(userId1) || isNaN(userId2)) {
      return NextResponse.json({error: "Invalid player IDs"}, {status: 400})
    }
    
    if (userId1 === userId2) {
      return NextResponse.json({error: "Cannot compare with self"}, {status: 400})
    }
    
    const comparison = await db.playerComparison.findUnique({
      where: {
        userId1_userId2: {
          userId1: Math.min(userId1, userId2),
          userId2: Math.max(userId1, userId2)
        }
      },
      include: {
        user1: { select: { id: true, name: true, skillProgression: true, userBadges: true } },
        user2: { select: { id: true, name: true, skillProgression: true, userBadges: true } }
      }
    })
    
    if (!comparison) {
      return NextResponse.json({error: "Comparison not found"}, {status: 404})
    }
    
    return NextResponse.json({
      player1: comparison.user1,
      player2: comparison.user2,
      xpDifference: comparison.xpDifference,
      rankDifference: comparison.rankDifference,
      skillsCommon: comparison.skillsCommon,
      skillsPlayer1Only: comparison.skillsUser1Only,
      skillsPlayer2Only: comparison.skillsUser2Only,
      badgeDifference: comparison.badgeDifference
    })
  } catch (error) {
    logger.error('GET /api/players/compare:', error)
    return NextResponse.json({error: "Failed to fetch comparison"}, {status: 500})
  }
}
```

---

## 🧠 SERVICE LAYER (WITH VALIDATION & ERROR HANDLING)

### BadgeService

```typescript
import { z } from 'zod'

const UserIdSchema = z.number().int().positive()
const BadgeIdSchema = z.number().int().positive()

export class BadgeService {
  async checkAndUnlockBadges(userId: number): Promise<Badge[]> {
    UserIdSchema.parse(userId)
    
    try {
      const progression = await db.skillProgression.findUniqueOrThrow({
        where: { userId }
      })
      
      const stats = await db.leaderboardStats.findUniqueOrThrow({
        where: { userId }
      })
      
      const badges = await db.badge.findMany({
        where: { active: true }
      })
      
      const unlockedBadges: Badge[] = []
      
      for (const badge of badges) {
        // Check if already unlocked
        const alreadyUnlocked = await db.userBadge.findUnique({
          where: { userId_badgeId: { userId, badgeId: badge.id } }
        })
        
        if (alreadyUnlocked) continue
        
        const shouldUnlock = await this.checkUnlockConditions(badge, progression, stats)
        
        if (shouldUnlock) {
          await db.userBadge.create({
            data: { userId, badgeId: badge.id }
          })
          
          // Award XP if badge has reward
          if (badge.xpReward > 0) {
            await progressionService.addXp(userId, badge.xpReward)
          }
          
          logger.info({ userId, badgeId: badge.id }, 'Badge unlocked')
          unlockedBadges.push(badge)
        }
      }
      
      return unlockedBadges
    } catch (error) {
      logger.error({ userId, error }, 'Failed to check and unlock badges')
      throw error
    }
  }
  
  private async checkUnlockConditions(
    badge: Badge,
    progression: SkillProgression,
    stats: LeaderboardStats
  ): Promise<boolean> {
    const condition = badge.unlockCondition as Record<string, any>
    
    switch (badge.unlockType) {
      case 'xp':
        return progression.totalXp >= condition.xpRequired
      
      case 'tier':
        return progression.currentTier >= condition.tierRequired
      
      case 'streak':
        return stats.maxStreak >= condition.streakRequired
      
      case 'leaderboard':
        return stats.globalRank !== null && stats.globalRank <= condition.rankRequired
      
      case 'quest_type':
        return stats.totalQuestsCompleted >= condition.questCount
      
      case 'achievement':
        // Check if user has completed prerequisite achievement
        const achCount = await db.userAchievement.count({
          where: {
            userId: stats.userId,
            completedAt: { not: null }
          }
        })
        return achCount >= condition.achievementCount
      
      default:
        return false
    }
  }
  
  async badgesByCategory(userId: number, category: string): Promise<Badge[]> {
    UserIdSchema.parse(userId)
    if (!category.match(/^[A-Z_]+$/)) throw new Error('Invalid category')
    
    try {
      return await db.badge.findMany({
        where: {
          category,
          active: true,
          userBadges: {
            some: { userId }
          }
        },
        include: {
          userBadges: {
            where: { userId },
            select: { unlockedAt: true }
          }
        }
      })
    } catch (error) {
      logger.error({ userId, category, error }, 'Failed to fetch category badges')
      throw error
    }
  }
}
```

### AchievementService

```typescript
export class AchievementService {
  async updateProgress(
    userId: number,
    trackingField: string,
    value: number
  ): Promise<UserAchievement[]> {
    UserIdSchema.parse(userId)
    
    try {
      const achievements = await db.achievement.findMany({
        where: { trackingField, active: true }
      })
      
      const completed: UserAchievement[] = []
      
      for (const achievement of achievements) {
        let userAch = await db.userAchievement.findUnique({
          where: { userId_achievementId: { userId, achievementId: achievement.id } }
        })
        
        // Create if doesn't exist
        if (!userAch) {
          userAch = await db.userAchievement.create({
            data: { userId, achievementId: achievement.id, progress: 0 }
          })
        }
        
        // Skip if already completed
        if (userAch.completedAt) continue
        
        // Calculate progress (0-100%)
        const progress = Math.min(100, (value / achievement.targetValue) * 100)
        const isCompleted = progress >= 100
        
        // Update progress
        const updated = await db.userAchievement.update({
          where: { id: userAch.id },
          data: {
            progress: Math.floor(progress),
            completedAt: isCompleted ? new Date() : null,
            notified: false
          }
        })
        
        // If just completed, award rewards
        if (isCompleted && !userAch.completedAt) {
          // Award XP
          await progressionService.addXp(userId, achievement.xpReward)
          
          // Award badge if linked
          if (achievement.badgeId) {
            await db.userBadge.upsert({
              where: { userId_badgeId: { userId, badgeId: achievement.badgeId } },
              create: { userId, badgeId: achievement.badgeId },
              update: { notified: false }
            })
          }
          
          logger.info({ userId, achievementId: achievement.id }, 'Achievement completed')
          completed.push(updated)
        }
      }
      
      return completed
    } catch (error) {
      logger.error({ userId, trackingField, error }, 'Failed to update achievement progress')
      throw error
    }
  }
  
  async getProgressForAchievement(userId: number, achievementId: number): Promise<number> {
    UserIdSchema.parse(userId)
    
    try {
      const userAch = await db.userAchievement.findUnique({
        where: { userId_achievementId: { userId, achievementId } }
      })
      
      return userAch?.progress || 0
    } catch (error) {
      logger.error({ userId, achievementId, error }, 'Failed to get achievement progress')
      throw error
    }
  }
}
```

### LeaderboardService

```typescript
export class LeaderboardService {
  async updateStats(userId: number): Promise<void> {
    UserIdSchema.parse(userId)
    
    try {
      const progression = await db.skillProgression.findUniqueOrThrow({
        where: { userId }
      })
      
      // Calculate global rank
      const rank = await db.skillProgression.count({
        where: { totalXp: { gt: progression.totalXp } }
      })
      
      // Get user creation date for XP/day calculation
      const user = await db.user.findUniqueOrThrow({ where: { id: userId } })
      const daysSinceCreation = Math.max(1, (Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000))
      const xpPerDay = progression.totalXp / daysSinceCreation
      
      // Get previous stats for trend
      const prev = await db.leaderboardStats.findUnique({ where: { userId } })
      const xpTrend = !prev ? 'stable' : 
                      xpPerDay > prev.xpPerDay ? 'rising' :
                      xpPerDay < prev.xpPerDay ? 'falling' :
                      'stable'
      
      // Calculate momentum (0-100)
      const momentum = Math.min(100, Math.floor((xpPerDay / 50) * 100))
      
      // Count badges and achievements
      const [badgeCount, achievementCount] = await Promise.all([
        db.userBadge.count({ where: { userId } }),
        db.userAchievement.count({ where: { userId, completedAt: { not: null } } })
      ])
      
      // Upsert stats
      await db.leaderboardStats.upsert({
        where: { userId },
        create: {
          userId,
          globalRank: rank + 1,
          xpPerDay,
          xpTrend: xpTrend,
          momentum,
          badgeCount,
          achievementCount
        },
        update: {
          globalRank: rank + 1,
          xpPerDay,
          xpTrend,
          momentum,
          badgeCount,
          achievementCount,
          lastUpdated: new Date()
        }
      })
      
      logger.info({ userId, rank }, 'Leaderboard stats updated')
    } catch (error) {
      logger.error({ userId, error }, 'Failed to update leaderboard stats')
      throw error
    }
  }
  
  async updatePlayerComparison(userId1: number, userId2: number): Promise<void> {
    if (userId1 === userId2) throw new Error('Cannot compare with self')
    
    try {
      const [prog1, prog2, skills1, skills2, badges1, badges2] = await Promise.all([
        db.skillProgression.findUniqueOrThrow({ where: { id: userId1 } }),
        db.skillProgression.findUniqueOrThrow({ where: { id: userId2 } }),
        db.playerSkill.findMany({ where: { userId: userId1, isUnlocked: true }, select: { skillId: true } }),
        db.playerSkill.findMany({ where: { userId: userId2, isUnlocked: true }, select: { skillId: true } }),
        db.userBadge.findMany({ where: { userId: userId1 }, select: { badgeId: true } }),
        db.userBadge.findMany({ where: { userId: userId2 }, select: { badgeId: true } })
      ])
      
      const skills1Set = new Set(skills1.map(s => s.skillId))
      const skills2Set = new Set(skills2.map(s => s.skillId))
      const badges1Set = new Set(badges1.map(b => b.badgeId))
      const badges2Set = new Set(badges2.map(b => b.badgeId))
      
      const commonSkills = [...skills1Set].filter(s => skills2Set.has(s)).length
      const commonBadges = [...badges1Set].filter(b => badges2Set.has(b)).length
      
      const xpDiff = prog1.totalXp - prog2.totalXp
      const badgeDiff = badges1.length - badges2.length
      
      const minId = Math.min(userId1, userId2)
      const maxId = Math.max(userId1, userId2)
      
      await db.playerComparison.upsert({
        where: { userId1_userId2: { userId1: minId, userId2: maxId } },
        create: {
          userId1: minId,
          userId2: maxId,
          xpDifference: xpDiff,
          xpRatio: (prog1.totalXp + 1) / (prog2.totalXp + 1),
          rankDifference: 0,
          skillsCommon: commonSkills,
          skillsUser1Only: skills1.length - commonSkills,
          skillsUser2Only: skills2.length - commonSkills,
          badgeDifference: badgeDiff,
          commonBadges
        },
        update: {
          xpDifference: xpDiff,
          xpRatio: (prog1.totalXp + 1) / (prog2.totalXp + 1),
          skillsCommon: commonSkills,
          skillsUser1Only: skills1.length - commonSkills,
          skillsUser2Only: skills2.length - commonSkills,
          badgeDifference: badgeDiff,
          commonBadges
        }
      })
    } catch (error) {
      logger.error({ userId1, userId2, error }, 'Failed to update player comparison')
      throw error
    }
  }
}
```

---

## 📱 FRONTEND COMPONENTS

### BadgeShowcase.tsx

```typescript
export function BadgeShowcase({ userId }: { userId: number }) {
  const [badges, setBadges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchBadges() {
      try {
        setError(null)
        const res = await fetch(`/api/badges/showcase/${userId}`)
        if (!res.ok) throw new Error('Failed to fetch')
        setBadges(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchBadges()
  }, [userId])
  
  if (loading) return <div className="p-4 text-center">Loading badges...</div>
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>
  if (!badges.length) return <div className="p-4 text-gray-500">No badges yet</div>
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {badges.map(badge => (
        <div
          key={badge.id}
          className="flex flex-col items-center justify-center p-3 bg-gradient-to-br rounded-lg cursor-pointer hover:shadow-lg transition"
          style={{
            background: badge.color ? `linear-gradient(135deg, ${badge.color}20, ${badge.color}40)` : '#f0f0f0',
            borderLeft: `4px solid ${badge.color || '#999'}`
          }}
          title={badge.description}
        >
          <div className="text-3xl mb-2">{badge.icon}</div>
          <div className="text-xs font-bold text-center">{badge.name}</div>
          <div className="text-2xs text-gray-600 text-center mt-1">
            {new Date(badge.unlockedAt).toLocaleDateString()}
          </div>
        </div>
      ))}
    </div>
  )
}
```

### AchievementProgress.tsx

```typescript
export function AchievementProgress({ userId }: { userId: number }) {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  useEffect(() => {
    async function fetch() {
      try {
        setError(null)
        const res = await fetch('/api/achievements')
        if (!res.ok) throw new Error('Failed to fetch')
        setAchievements(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])
  
  const filtered = categoryFilter === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === categoryFilter)
  
  const completed = filtered.filter(a => a.userProgress.completedAt)
  const inProgress = filtered.filter(a => !a.userProgress.completedAt)
  
  if (loading) return <div>Loading achievements...</div>
  if (error) return <div className="text-red-500">{error}</div>
  
  return (
    <div className="space-y-6 p-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold">{completed.length}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold">{inProgress.length}</div>
          <div className="text-sm text-gray-500">In Progress</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold">{
            Math.round((completed.length / filtered.length) * 100 || 0)
          }%</div>
          <div className="text-sm text-gray-500">Progress</div>
        </div>
      </div>
      
      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3">✅ Completed</h3>
          <div className="space-y-2">
            {completed.map(ach => (
              <div key={ach.id} className="card flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{ach.name}</h4>
                  <p className="text-sm text-gray-600">{ach.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-500">{ach.xpReward} XP</div>
                  <div className="text-xs text-gray-500">
                    {new Date(ach.userProgress.completedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* In Progress */}
      {inProgress.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3">⏳ In Progress</h3>
          <div className="space-y-3">
            {inProgress.map(ach => (
              <div key={ach.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{ach.name}</h4>
                    <p className="text-sm text-gray-600">{ach.description}</p>
                  </div>
                  <span className="text-sm font-bold">{ach.userProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${ach.userProgress.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### GlobalLeaderboard.tsx

```typescript
export function GlobalLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 50
  
  useEffect(() => {
    async function fetch() {
      try {
        setError(null)
        const res = await fetch(`/api/leaderboard/global?page=${page}&limit=${limit}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setLeaderboard(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [page])
  
  if (loading) return <div>Loading leaderboard...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!leaderboard.length) return <div>No leaderboard data</div>
  
  return (
    <div className="p-4 space-y-4">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Rank</th>
            <th className="p-2 text-left">Player</th>
            <th className="p-2 text-center">XP</th>
            <th className="p-2 text-center">Tier</th>
            <th className="p-2 text-center">Badges</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((stat, idx) => (
            <tr key={stat.userId} className="border-b hover:bg-gray-50">
              <td className="p-2 font-bold">{(page - 1) * limit + idx + 1}</td>
              <td className="p-2">
                <button
                  onClick={() => /* navigate to profile */}
                  className="text-blue-500 hover:underline"
                >
                  {stat.user.name}
                </button>
              </td>
              <td className="p-2 text-center font-bold">{stat.globalRank?.totalXp || 0}</td>
              <td className="p-2 text-center">Tier {stat.globalRank?.currentTier || 1}</td>
              <td className="p-2 text-center">{stat.badgeCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### PlayerComparison.tsx

```typescript
export function PlayerComparison({ userId1, userId2 }: { userId1: number; userId2: number }) {
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetch() {
      try {
        setError(null)
        const res = await fetch(`/api/players/${userId1}/compare/${userId2}`)
        if (!res.ok) throw new Error('Failed to fetch')
        setComparison(await res.json())
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    if (userId1 !== userId2) fetch()
  }, [userId1, userId2])
  
  if (loading) return <div>Loading comparison...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!comparison) return <div>No comparison available</div>
  
  const isPlayer1Ahead = comparison.xpDifference > 0
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
      {/* Player 1 */}
      <div className="card">
        <h3 className="font-bold text-lg mb-4">{comparison.player1.name}</h3>
        <div className="space-y-2">
          <div>XP: <span className="font-bold">{comparison.player1.skillProgression?.totalXp || 0}</span></div>
          <div>Tier: <span className="font-bold">{comparison.player1.skillProgression?.currentTier || 1}</span></div>
          <div>Badges: <span className="font-bold">{comparison.player1.userBadges?.length || 0}</span></div>
        </div>
      </div>
      
      {/* Comparison */}
      <div className="card flex flex-col justify-center items-center text-center space-y-3">
        <div>
          <div className="text-3xl font-bold">VS</div>
        </div>
        <div className="w-full space-y-2 text-sm">
          <div>
            <span className={isPlayer1Ahead ? 'text-green-500' : 'text-gray-500'}>
              {isPlayer1Ahead ? '✓ Ahead' : '✗ Behind'}
            </span>
            <br />
            XP: {Math.abs(comparison.xpDifference)}
          </div>
          <div>
            <span className="text-blue-500">⚔️ Common Skills</span>
            <br />
            {comparison.skillsCommon}
          </div>
        </div>
      </div>
      
      {/* Player 2 */}
      <div className="card">
        <h3 className="font-bold text-lg mb-4">{comparison.player2.name}</h3>
        <div className="space-y-2">
          <div>XP: <span className="font-bold">{comparison.player2.skillProgression?.totalXp || 0}</span></div>
          <div>Tier: <span className="font-bold">{comparison.player2.skillProgression?.currentTier || 1}</span></div>
          <div>Badges: <span className="font-bold">{comparison.player2.userBadges?.length || 0}</span></div>
        </div>
      </div>
    </div>
  )
}
```

---

## 🧪 TESTING EXAMPLES

```typescript
// __tests__/badges.test.ts
import { BadgeService } from '@/services/badgeService'

describe('Badge System', () => {
  it('should unlock badge when XP threshold met', async () => {
    const user = await createTestUser()
    const badge = await db.badge.create({
      data: {
        code: 'TEST_BADGE',
        name: 'Test',
        unlockType: 'xp',
        unlockCondition: { xpRequired: 100 }
      }
    })
    
    await progressionService.addXp(user.id, 100)
    const unlocked = await badgeService.checkAndUnlockBadges(user.id)
    
    expect(unlocked).toContainEqual(expect.objectContaining({ id: badge.id }))
  })
  
  it('should not duplicate badge unlocks', async () => {
    const user = await createTestUser()
    const badge = await db.badge.create({
      data: { code: 'TEST', name: 'Test', unlockType: 'xp', unlockCondition: { xpRequired: 50 } }
    })
    
    await progressionService.addXp(user.id, 100)
    await badgeService.checkAndUnlockBadges(user.id)
    await badgeService.checkAndUnlockBadges(user.id)
    
    const count = await db.userBadge.count({ where: { userId: user.id, badgeId: badge.id } })
    expect(count).toBe(1)
  })
})

// __tests__/achievements.test.ts
describe('Achievement System', () => {
  it('should track achievement progress', async () => {
    const user = await createTestUser()
    const ach = await db.achievement.create({
      data: {
        code: 'TEST_ACH',
        name: 'Test',
        type: 'counter',
        targetValue: 5,
        trackingField: 'quests_completed'
      }
    })
    
    await achievementService.updateProgress(user.id, 'quests_completed', 3)
    const progress = await achievementService.getProgressForAchievement(user.id, ach.id)
    expect(progress).toBe(60) // 3/5 = 60%
  })
  
  it('should complete achievement and award rewards', async () => {
    const user = await createTestUser()
    const badge = await db.badge.create({
      data: { code: 'ACH_BADGE', name: 'Achievement Badge', unlockType: 'xp', unlockCondition: {} }
    })
    const ach = await db.achievement.create({
      data: {
        code: 'REWARD_ACH',
        name: 'Reward Achievement',
        type: 'counter',
        targetValue: 3,
        trackingField: 'audits_completed',
        xpReward: 100,
        badgeId: badge.id
      }
    })
    
    const before = (await db.skillProgression.findUnique({ where: { id: user.id } }))?.totalXp || 0
    await achievementService.updateProgress(user.id, 'audits_completed', 3)
    const after = (await db.skillProgression.findUnique({ where: { id: user.id } }))?.totalXp || 0
    
    expect(after).toBe(before + 100)
    
    const hasBadge = await db.userBadge.findUnique({
      where: { userId_badgeId: { userId: user.id, badgeId: badge.id } }
    })
    expect(hasBadge).toBeDefined()
  })
})

// __tests__/leaderboard.test.ts
describe('Leaderboard System', () => {
  it('should update leaderboard stats correctly', async () => {
    const user1 = await createTestUser()
    const user2 = await createTestUser()
    
    await progressionService.addXp(user1.id, 500)
    await progressionService.addXp(user2.id, 300)
    
    await leaderboardService.updateStats(user1.id)
    await leaderboardService.updateStats(user2.id)
    
    const stats1 = await db.leaderboardStats.findUnique({ where: { userId: user1.id } })
    const stats2 = await db.leaderboardStats.findUnique({ where: { userId: user2.id } })
    
    expect(stats1?.globalRank).toBeLessThan(stats2?.globalRank || Infinity)
  })
})
```

---

## ✅ ACCEPTANCE CRITERIA

✅ Badge system with 25+ badges (5S, PS, Competitive, Social)  
✅ Achievement system tracking 15+ achievements  
✅ Auto-unlock badges when conditions met  
✅ Auto-progress achievements on game events  
✅ Global leaderboard (all-time)  
✅ By-skill leaderboards  
✅ Trending/velocity leaderboard  
✅ Weekly/monthly leaderboards  
✅ Player comparison view  
✅ All API endpoints return proper error codes  
✅ Input validation on all routes (Zod)  
✅ Frontend components with loading/error states  
✅ Toast notifications for badge/achievement unlocks  
✅ Mobile responsive  
✅ Unit tests (80%+ coverage)  
✅ No console errors  
✅ TypeScript strict mode passing  

---

## 🚀 MVP SCOPE (8-10 HOURS)

### Phase 1: Models + Seed Data (2 hours)
- ✅ Prisma models (Badge, Achievement, LeaderboardStats, PlayerComparison)
- ✅ Database migration
- ✅ Seed 25+ badges
- ✅ Seed 15+ achievements
- ✅ Create initial leaderboard records

### Phase 2: Services + API (3 hours)
- ✅ BadgeService (unlock logic, by-category)
- ✅ AchievementService (progress tracking, completion)
- ✅ LeaderboardService (stats updates, comparisons)
- ✅ API endpoints (badges, achievements, leaderboards, comparison)
- ✅ Error handling & validation

### Phase 3: Frontend (2.5 hours)
- ✅ BadgeShowcase component
- ✅ AchievementProgress component
- ✅ GlobalLeaderboard component
- ✅ PlayerComparison component
- ✅ Toast notifications
- ✅ Mobile responsive

### Phase 4: Testing + Polish (1.5 hours)
- ✅ Unit tests (badges, achievements, leaderboard)
- ✅ Error boundaries
- ✅ Documentation
- ✅ Performance optimization

---

## 📊 INTEGRATION POINTS

```
WHEN Mini-Game Completes:
├─ Award XP → progressionService.addXp()
├─ Check achievement progress → achievementService.updateProgress()
├─ Auto-unlock badges → badgeService.checkAndUnlockBadges()
├─ Update leaderboard → leaderboardService.updateStats()
└─ Send notifications → toast()

WHEN Player Opens Profile:
├─ Show badges → BadgeShowcase
├─ Show achievements → AchievementProgress
├─ Show leaderboard position → LeaderboardStats
└─ Load comparison if viewing other player
```

---

## 📝 LOGGING & MONITORING

```typescript
logger.info({userId, badgeId}, 'Badge unlocked')
logger.info({userId, achievementId, progress}, 'Achievement progress updated')
logger.info({userId, rank}, 'Leaderboard stats updated')
logger.error({userId, error}, 'Failed to unlock badge')
logger.error({userId, error}, 'Failed to update achievement')
```

---

## 🎯 DEPLOYMENT CHECKLIST

☐ All tests passing (80%+ coverage)  
☐ Seed data loaded (25 badges, 15 achievements)  
☐ Database migration successful  
☐ API contracts documented  
☐ Frontend components tested on mobile  
☐ Performance acceptable (< 200ms API)  
☐ No console errors  
☐ TypeScript strict mode passing  
☐ Error handling complete  
☐ Logging integrated  

---

**STATUS: READY FOR CODEX ✅**  
**ASSIGNMENT:** Gamification Enhancement (Badges, Achievements, Leaderboards)  
**TIMELINE:** Week 4-5  
**COMPLEXITY:** MEDIUM-HIGH  
**QUALITY:** Production-Ready with Full Error Handling  
**ESTIMATED HOURS:** 8-10  
