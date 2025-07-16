'use client'

import { useState, useEffect } from 'react'
import { supabase, BoardPost } from '@/lib/supabase'
import Link from 'next/link'

export default function BoardList() {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">게시판</h1>
        <Link 
          href="/board/write" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          글쓰기
        </Link>
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
  )
} 