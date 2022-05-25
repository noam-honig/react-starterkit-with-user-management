import { fetchEventSource } from '@microsoft/fetch-event-source';


export function listenToServerEvents(url: string, args: { onMessage: (data: any, eventType: string) => void, jwtToken?: string }) {
    const ctrl = new AbortController();

    fetchEventSource(url, {
        headers: args.jwtToken ? {
            "Authorization": "Bearer " + args.jwtToken
        } : undefined,
        onmessage: message => {
            if (message.event !== 'keep-alive') {
                args.onMessage(JSON.parse(message.data), message.event);
            }
        },
        signal: ctrl.signal,
    });
    return () => ctrl.abort();
}