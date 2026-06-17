import { notFound } from "next/navigation";
import { StudyBrief } from "@/components/studies/StudyBrief";
import { getStudyById } from "@/lib/db/queries";

type Props = {
  params: { id: string };
};

export default async function StudyDetailPage({ params }: Props) {
  const study = await getStudyById(params.id);
  if (!study) notFound();

  return (
    <div className="max-w-7xl mx-auto">
      <StudyBrief study={study} />
    </div>
  );
}
