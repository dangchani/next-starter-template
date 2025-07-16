'use client'

import dynamic from 'next/dynamic'
import { use } from 'react'

const BoardForm = dynamic(() => import('@/components/BoardForm'), {
  ssr: false,
  loading: () => <div className="text-center py-8">로딩 중...</div>
})

interface BoardEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default function BoardEditPage({ params }: BoardEditPageProps) {
  const { id } = use(params)
  return <BoardForm postId={parseInt(id)} isEdit={true} />
} 