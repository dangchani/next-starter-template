'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, BoardPost } from '@/lib/supabase'
import Link from 'next/link'

interface BoardDetailProps {
  postId: number
}

export default function BoardDetail({ postId }: BoardDetailProps) {
  const router = useRouter()
  const [post, setPost] = useState<BoardPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPost()
    
    // Realtime 구독 설정 (특정 게시글의 변경사항만 모니터링)
    const channel = supabase
      .channel(`board_post_${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'board_posts',
          filter: `id=eq.${postId}`,
        },
        (payload) => {
          console.log('게시글 수정 이벤트:', payload)
          // 게시글 수정 시 직접 업데이트
          if (payload.new) {
            setPost(payload.new as BoardPost)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'board_posts',
          filter: `id=eq.${postId}`,
        },
        (payload) => {
          console.log('게시글 삭제 이벤트:', payload)
          // 게시글이 삭제되면 목록으로 리다이렉트
          router.push('/board')
        }
      )
      .subscribe((status) => {
        console.log(`게시글 ${postId} Realtime 상태:`, status)
      })

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      supabase.removeChannel(channel)
    }
  }, [postId, router])

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('board_posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) {
        console.error('게시글 조회 오류:', error.message || error.details || error)
        
        // 테이블이 없는 경우 안내
        if (error.message && error.message.includes('does not exist')) {
          console.log('board_posts 테이블이 없습니다. Supabase 대시보드에서 테이블을 생성해주세요.')
        }
        return
      }

      setPost(data)
    } catch (error) {
      console.error('게시글 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async () => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('board_posts')
        .delete()
        .eq('id', postId)

      if (error) {
        console.error('삭제 오류:', error)
        return
      }

      router.push('/board')
    } catch (error) {
      console.error('삭제 오류:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  if (!post) {
    return <div className="text-center py-8">게시글을 찾을 수 없습니다.</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {post.title}
          </h1>
          <div className="flex items-center text-sm text-gray-500 space-x-4">
            <span>작성자: {post.author}</span>
            <span>작성일: {new Date(post.created_at!).toLocaleDateString()}</span>
            {post.updated_at && (
              <span>수정일: {new Date(post.updated_at).toLocaleDateString()}</span>
            )}
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
            {post.content}
          </div>
        </div>

        <div className="flex space-x-4 pt-6 border-t border-gray-200">
          <Link
            href="/board"
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            목록으로
          </Link>
          <Link
            href={`/board/edit/${post.id}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            수정
          </Link>
          <button
            onClick={deletePost}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  )
} 