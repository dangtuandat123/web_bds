import { getSettings } from '@/app/actions/settings'
import ChatWidget from './chat-widget'

export default async function ChatWidgetWrapper() {
    const result = await getSettings()
    const siteName = result.data?.site_name || 'Bất Động Sản'

    return <ChatWidget siteName={siteName} />
}
