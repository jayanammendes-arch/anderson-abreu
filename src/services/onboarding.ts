import pb from '@/lib/pocketbase/client'
import type { OnboardingConfig } from '@/types'

export async function getOnboardingConfig(): Promise<OnboardingConfig | null> {
  try {
    const records = await pb.collection('onboarding_config').getFullList()
    return records[0] || null
  } catch {
    return null
  }
}

export function getCoverImageUrl(config: OnboardingConfig): string | null {
  if (!config.cover_image) return null
  return `${import.meta.env.VITE_POCKETBASE_URL}/api/files/onboarding_config/${config.id}/${config.cover_image}`
}

export async function updateOnboardingConfig(
  id: string,
  data: FormData,
): Promise<OnboardingConfig> {
  return pb.collection('onboarding_config').update(id, data)
}

export async function createOnboardingConfig(data: FormData): Promise<OnboardingConfig> {
  return pb.collection('onboarding_config').create(data)
}
