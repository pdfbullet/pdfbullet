'use client';
import { useParams } from 'next/navigation';
import ToolPage from '../../../views/ToolPage';
import AIQuestionGeneratorPage from '../../../views/AIQuestionGeneratorPage';
import AIImageGeneratorPage from '../../../views/AIImageGeneratorPage';
import InvoiceGeneratorPage from '../../../views/InvoiceGeneratorPage';
import CVGeneratorPage from '../../../views/CVGeneratorPage';
import LessonPlanCreatorPage from '../../../views/LessonPlanCreatorPage';
import PremiumFeaturePage from '../../../views/PremiumFeaturePage';

export default function ToolRoute() {
  const params = useParams();
  const toolId = params?.toolId as string;

  if (toolId === 'premium-feature') {
    return <PremiumFeaturePage />;
  }
  if (toolId === 'ai-image-generator') {
    return <AIImageGeneratorPage />;
  }
  if (toolId === 'ai-question-generator') {
    return <AIQuestionGeneratorPage />;
  }
  if (toolId === 'invoice-generator') {
    return <InvoiceGeneratorPage />;
  }
  if (toolId === 'cv-generator') {
    return <CVGeneratorPage />;
  }
  if (toolId === 'lesson-plan-creator') {
    return <LessonPlanCreatorPage />;
  }

  return <ToolPage />;
}
