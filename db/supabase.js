import { config } from "dotenv";
config();
// supabase imports
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)   
export const insertMessage = async (content, username) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert({ content, username })
            .select()
        if (error) throw error
        return data
    } catch (error) {
        console.error('Ha ocurrido un error al insertar', error)
    }
}
export const getMessages = async (offset = 0) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select()
            .gt('id', offset) // <-- buscar los mensajes posteriores al offset
        if (error) throw error
        return data

    } catch (error) {
        console.error('Ha ocurrido un error al recuperar')
    }
}