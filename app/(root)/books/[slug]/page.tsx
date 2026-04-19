import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Mic, MicOff } from "lucide-react";

import { getBookBySlug } from "@/lib/actions/book.actions";
import { getVoice } from "@/lib/utils";

type BookDetailsPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

const BookDetailsPage = async ({ params }: BookDetailsPageProps) => {
    const { userId } = await auth();

    if (!userId) {
        redirect("/");
    }

    const { slug } = await params;
    const result = await getBookBySlug(slug);

    if (!result.success || !result.data) {
        redirect("/");
    }

    const book = result.data;
    const voice = getVoice(book.persona);

    return (
        <main className="book-page-container">
            <Link href="/" className="back-btn-floating" aria-label="Back to library">
                <ArrowLeft className="size-5 text-[#212a3b]" />
            </Link>

            <div className="mx-auto flex max-w-4xl flex-col gap-6">
                <section className="vapi-header-card">
                    <div className="relative shrink-0">
                        <Image
                            src={book.coverURL}
                            alt={book.title}
                            width={120}
                            height={180}
                            className="h-auto w-[120px] rounded-lg object-cover shadow-lg"
                        />

                        <button
                            type="button"
                            className="vapi-mic-btn absolute -bottom-3 -right-3 shadow-md"
                            aria-label="Start conversation"
                        >
                            <MicOff className="size-6 text-[#212a3b]" />
                        </button>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
                        <div className="space-y-1">
                            <h1 className="font-serif text-2xl font-bold text-[#212a3b] sm:text-3xl">
                                {book.title}
                            </h1>
                            <p className="text-base text-[#4f5a6d] sm:text-lg">by {book.author}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="vapi-status-indicator">
                                <span className="vapi-status-dot vapi-status-dot-ready" />
                                <span className="vapi-status-text">Ready</span>
                            </div>

                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">Voice: {voice.name}</span>
                            </div>

                            <div className="vapi-status-indicator">
                                <span className="vapi-status-text">0:00/15:00</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="transcript-container min-h-[400px]">
                    <div className="transcript-empty">
                        <Mic className="mb-4 size-12 text-[#212a3b]" aria-hidden="true" />
                        <p className="transcript-empty-text">No conversation yet</p>
                        <p className="transcript-empty-hint">
                            Click the mic button above to start talking
                        </p>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default BookDetailsPage;
