import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchBreedsPage, fetchBreedImage, postVote, fetchVotes } from './dogApi'

function mockFetch(data: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
  })
}

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch([]))
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchBreedsPage', () => {
  it('returns parsed breed array', async () => {
    const breeds = [{ id: 1, name: 'Affenpinscher' }]
    vi.stubGlobal('fetch', mockFetch(breeds))
    const result = await fetchBreedsPage(0)
    expect(result).toEqual(breeds)
  })

  it('throws on non-2xx response', async () => {
    vi.stubGlobal('fetch', mockFetch({}, false, 500))
    await expect(fetchBreedsPage(0)).rejects.toThrow('[500]')
  })
})

describe('fetchBreedImage', () => {
  it('returns image data', async () => {
    const image = { id: 'abc', url: 'https://example.com/img.jpg', width: 800, height: 600 }
    vi.stubGlobal('fetch', mockFetch(image))
    const result = await fetchBreedImage('abc')
    expect(result).toEqual(image)
  })
})

describe('postVote', () => {
  it('sends POST with correct body', async () => {
    const fetchMock = mockFetch({ id: 42, message: 'SUCCESS' })
    vi.stubGlobal('fetch', fetchMock)

    await postVote({ imageId: 'img-1', value: 1 })

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({ image_id: 'img-1', value: 1, sub_id: 'test-sub-id' })
    expect(init.method).toBe('POST')
  })

  it('throws on failure', async () => {
    vi.stubGlobal('fetch', mockFetch({}, false, 422))
    await expect(postVote({ imageId: 'x', value: 1 })).rejects.toThrow('[422]')
  })
})

describe('fetchVotes', () => {
  it('includes sub_id in query string', async () => {
    const fetchMock = mockFetch([])
    vi.stubGlobal('fetch', fetchMock)
    await fetchVotes()
    const [url] = fetchMock.mock.calls[0] as [string]
    expect(url).toContain('sub_id=test-sub-id')
    expect(url).toContain('limit=100')
    expect(url).toContain('page=0')
    expect(url).toContain('order=ASC')
  })
})
