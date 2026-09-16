import React from 'react'
import { getPlayers } from '@/lib/actions/player-actions'
import { PlayersListClient } from './players-client'

export const dynamic = 'force-dynamic'

export default async function PlayersPage() {
  const { data: players } = await getPlayers()
  return <PlayersListClient initialPlayers={players || []} />
}
