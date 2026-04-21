import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, MicOff } from "lucide-react";
import VapiControls from "@/components/VapiControls" 
import { getBookBySlug } from "@/lib/actions/book.actions";

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


    return (
        <main className="book-page-container">
            <Link href="/" className="back-btn-floating" aria-label="Back to library">
                <ArrowLeft className="size-5 text-[#212a3b]" />
            </Link>

            <VapiControls book={book} />

        </main>
    );
};

export default BookDetailsPage;
