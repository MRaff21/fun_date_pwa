export type DateKind = 'activity' | 'food' | 'event' | 'outdoors'

export type DateIdea = {
  id: string
  title: string
  eyebrow: string
  description: string
  kind: DateKind
  location: string
  area: string
  price: string
  duration: string
  image: string
  tags: string[]
  active: boolean
  featured?: boolean
  eventDate?: string
}

export type AppTab = 'discover' | 'plan' | 'manage' | 'profile'

export type IdeaDraft = Pick<
  DateIdea,
  'title' | 'description' | 'kind' | 'location' | 'area' | 'price' | 'duration' | 'eventDate'
>
