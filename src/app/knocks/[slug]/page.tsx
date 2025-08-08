export default function Knock(
    { params }: { params: { slug: string }}){
        return (
            <main>
                <h1>{params.slug}</h1>
                <p>Hello from {params.slug}</p>
            </main>
        )
    }
)