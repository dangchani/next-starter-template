'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface BoardFormProps {
  postId?: number
  isEdit?: boolean
}

export default function BoardForm({ postId, isEdit = false }: BoardFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: ''
  })
  const [loading, setLoading] = useState(false)

  const fetchPost = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('board_posts')
        .select('*')
        .eq('id', postId)
        .single()

      if (error) {
        console.error('게시글 조회 오류:', error.message || error.details || error)
        return
      }

      if (data) {
        setFormData({
          title: data.title,
          content: data.content,
          author: data.author
        })
      }
    } catch (error) {
      console.error('게시글 조회 오류:', error)
    }
  }, [postId])

  useEffect(() => {
    if (isEdit && postId) {
      fetchPost()
    }
  }, [isEdit, postId, fetchPost])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit && postId) {
        // 수정
        const { error } = await supabase
          .from('board_posts')
          .update({
            title: formData.title,
            content: formData.content,
            author: formData.author,
            updated_at: new Date().toISOString()
          })
          .eq('id', postId)

        if (error) {
          console.error('수정 오류:', error)
          return
        }
      } else {
        // 새 글 작성
        const response = await supabase
          .from('board_posts')
          .insert([{
            title: formData.title,
            content: formData.content,
            author: formData.author
          }])

        console.log('Supabase 응답 전체:', response)
        console.log('Supabase 응답 data:', response.data)
        console.log('Supabase 응답 error:', response.error)

        if (response.error) {
          console.error('작성 오류 전체 객체:', response.error)
          console.error('작성 오류 message:', response.error.message)
          console.error('작성 오류 details:', response.error.details)
          console.error('작성 오류 code:', response.error.code)
          console.error('작성 오류 hint:', response.error.hint)
          
          // 테이블이 없는 경우 안내
          if (response.error.message && response.error.message.includes('does not exist')) {
            alert('board_posts 테이블이 없습니다. Supabase 대시보드에서 테이블을 생성해주세요.')
          } else {
            alert('작성 오류: ' + (response.error.message || response.error.details || response.error.code || JSON.stringify(response.error)))
          }
          return
        }
      }

      router.push('/board')
    } catch (error) {
      console.error('저장 오류:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }



  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? '게시글 수정' : '새 게시글 작성'}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            제목
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="제목을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
            작성자
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="작성자를 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="내용을 입력하세요"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg"
          >
            {loading ? '저장 중...' : (isEdit ? '수정' : '작성')}
          </button>
          <button
            type="button"
            onClick={() => router.push('/board')}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
} 