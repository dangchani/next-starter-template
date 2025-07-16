'use client'

import { useState, useEffect } from 'react'
import { supabase, BoardPost } from '@/lib/supabase'
import Link from 'next/link'
import RealtimeToast, { useRealtimeToast } from './RealtimeToast'

export default function BoardList() {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const { messages, addMessage, removeMessage } = useRealtimeToast()

  useEffect(() => {
    console.log('BoardList 컴포넌트 마운트')
    fetchPosts()
    
    // Realtime 구독 설정
    const channel = supabase
      .channel('board_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'board_posts',
        },
        (payload) => {
          console.log('INSERT 이벤트:', payload)
          // 새 게시글을 목록 맨 위에 추가
          setPosts(prevPosts => [payload.new as BoardPost, ...prevPosts])
          addMessage('새 게시글이 작성되었습니다!', 'success')
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'board_posts',
        },
        (payload) => {
          console.log('UPDATE 이벤트:', payload)
          // 게시글 수정 시 해당 게시글만 업데이트
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === payload.new.id ? payload.new as BoardPost : post
            )
          )
          addMessage('게시글이 수정되었습니다!', 'info')
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'board_posts',
        },
        (payload) => {
          console.log('DELETE 이벤트:', payload)
          // 게시글 삭제 시 해당 게시글만 제거
          setPosts(prevPosts => 
            prevPosts.filter(post => post.id !== payload.old.id)
          )
          addMessage('게시글이 삭제되었습니다!', 'warning')
        }
      )
      .subscribe((status) => {
        console.log('Realtime 상태:', status)
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected')
          addMessage('실시간 연결이 활성화되었습니다!', 'success')
        } else {
          setRealtimeStatus('disconnected')
          addMessage('실시간 연결이 끊어졌습니다!', 'warning')
        }
      })

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      console.log('BoardList 컴포넌트 언마운트, 채널 제거')
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchPosts = async () => {
    try {
      console.log('fetchPosts 실행 중...')
      const { data, error } = await supabase
        .from('board_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('게시글 조회 오류 전체 객체:', error)
        console.error('게시글 조회 오류 message:', error.message)
        console.error('게시글 조회 오류 details:', error.details)
        console.error('게시글 조회 오류 code:', error.code)
        console.error('게시글 조회 오류 hint:', error.hint)
        
        // 테이블이 없는 경우 안내
        if (error.message && error.message.includes('does not exist')) {
          console.log('board_posts 테이블이 없습니다. Supabase 대시보드에서 테이블을 생성해주세요.')
        }
        return
      }

      console.log('가져온 게시글 수:', data?.length || 0)
      setPosts(data || [])
    } catch (error) {
      console.error('게시글 조회 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const deletePost = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('board_posts')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('삭제 오류:', error)
        return
      }

      fetchPosts() // 목록 새로고침
    } catch (error) {
      console.error('삭제 오류:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>
  }

  return (
    <>
      <RealtimeToast messages={messages} onRemove={removeMessage} />
      <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">게시판</h1>
          <div className="flex items-center mt-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              realtimeStatus === 'connected' ? 'bg-green-500' : 
              realtimeStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-sm text-gray-600">
              {realtimeStatus === 'connected' ? '실시간 연결됨' : 
               realtimeStatus === 'connecting' ? '연결 중...' : '연결 끊김'}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              console.log('수동 새로고침 실행')
              fetchPosts()
              addMessage('목록을 새로고침했습니다!', 'info')
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
          >
            새로고침
          </button>
          <Link 
            href="/board/write" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            글쓰기
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성자
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작성일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                관리
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  게시글이 없습니다.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {post.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      href={`/board/${post.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-900"
                    >
                      {post.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {post.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(post.created_at!).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link 
                        href={`/board/edit/${post.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        수정
                      </Link>
                      <button
                        onClick={() => deletePost(post.id!)}
                        className="text-red-600 hover:text-red-900"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  )
} 