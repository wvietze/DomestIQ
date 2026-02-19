import { createClient } from '@/lib/supabase/server'
import { askClaude } from './claude'

interface WorkerRecommendation {
  workerId: string
  score: number
  reason: string
}

interface SmartMatchInput {
  clientId: string
  serviceId?: string
  description?: string
}

interface SmartMatchResult {
  recommendations: WorkerRecommendation[]
}

/**
 * Get smart worker recommendations for a client.
 *
 * 1. Queries top workers from the search_workers RPC based on filters.
 * 2. Sends worker profiles to Claude for intelligent ranking and reasoning.
 */
export async function getSmartRecommendations(
  input: SmartMatchInput
): Promise<SmartMatchResult> {
  const supabase = await createClient()

  // Look up client location for proximity search
  const { data: clientProfile } = await supabase
    .from('client_profiles')
    .select('location_lat, location_lng')
    .eq('user_id', input.clientId)
    .single()

  const lat = clientProfile?.location_lat ?? -26.2041 // Default: Johannesburg
  const lng = clientProfile?.location_lng ?? 28.0473

  // Build RPC arguments
  const rpcArgs: {
    search_lat: number
    search_lng: number
    search_radius_km: number
    service_filter?: string
    min_rating?: number
  } = {
    search_lat: lat,
    search_lng: lng,
    search_radius_km: 50,
  }

  if (input.serviceId) {
    rpcArgs.service_filter = input.serviceId
  }

  const { data: workers, error } = await supabase.rpc(
    'search_workers',
    rpcArgs
  )

  if (error || !workers || workers.length === 0) {
    return { recommendations: [] }
  }

  // Limit to top 10 workers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const topWorkers = (workers as any[]).slice(0, 10)

  // Build context for Claude
  const workerProfiles = topWorkers.map((w, index) => ({
    index: index + 1,
    workerId: w.worker_id,
    name: w.full_name,
    bio: w.bio,
    hourlyRate: w.hourly_rate,
    rating: w.overall_rating,
    totalReviews: w.total_reviews,
    distanceKm: w.distance_km,
    services: w.services,
    isVerified: w.is_verified,
  }))

  const descriptionContext = input.description
    ? `The client's specific request: "${input.description}"`
    : 'The client is looking for a reliable domestic worker.'

  const claudeResponse = await askClaude({
    system: `You are a matching assistant for a domestic services platform in South Africa. Given a list of available workers and a client's needs, rank the workers and provide a brief reason why each is a good match. Return a JSON array of objects with fields: workerIndex (number), score (1-100), reason (string). Only include the JSON array, nothing else.`,
    prompt: `${descriptionContext}

Available workers:
${JSON.stringify(workerProfiles, null, 2)}

Rank these workers from best to worst match. Consider distance, rating, reviews, verification status, and relevance of services.`,
    model: 'claude-haiku-4-5-20251001',
    maxTokens: 1024,
  })

  // Parse Claude's response
  try {
    const jsonMatch = claudeResponse.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      // Fallback: return workers sorted by rating
      return {
        recommendations: topWorkers.map((w) => ({
          workerId: w.worker_id,
          score: Math.round(w.overall_rating * 20),
          reason: `Rated ${w.overall_rating}/5 with ${w.total_reviews} reviews, ${w.distance_km.toFixed(1)}km away.`,
        })),
      }
    }

    const rankings: Array<{
      workerIndex: number
      score: number
      reason: string
    }> = JSON.parse(jsonMatch[0])

    return {
      recommendations: rankings
        .map((r) => {
          const worker = topWorkers[r.workerIndex - 1]
          if (!worker) return null
          return {
            workerId: worker.worker_id,
            score: r.score,
            reason: r.reason,
          }
        })
        .filter((r): r is WorkerRecommendation => r !== null),
    }
  } catch {
    // Fallback: return workers sorted by rating
    return {
      recommendations: topWorkers.map((w) => ({
        workerId: w.worker_id,
        score: Math.round(w.overall_rating * 20),
        reason: `Rated ${w.overall_rating}/5 with ${w.total_reviews} reviews, ${w.distance_km.toFixed(1)}km away.`,
      })),
    }
  }
}
