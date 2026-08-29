const DOG_API_KEY = import.meta.env.VITE_DOG_API_KEY
const SUB_ID = import.meta.env.VITE_SUB_ID

if (!DOG_API_KEY) throw new Error('VITE_DOG_API_KEY is not set')
if (!SUB_ID) throw new Error('VITE_SUB_ID is not set')

export { DOG_API_KEY, SUB_ID }
