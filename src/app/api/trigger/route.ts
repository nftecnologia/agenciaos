import { NextRequest, NextResponse } from "next/server";
import { intelligentAIJob, intelligentWebhookJob, intelligentReportJob } from "../../../trigger";
import type { SimpleAIPayload, SimpleWebhookPayload } from "../../../trigger";

export async function POST(request: NextRequest) {
  try {
    const { type, payload } = await request.json();

    switch (type) {
      case "ai-content":
        const aiResult = await intelligentAIJob.trigger(payload as SimpleAIPayload);
        return NextResponse.json({
          success: true,
          jobId: aiResult.id,
          message: "Job de IA inteligente iniciado",
          result: aiResult.result || null,
          processingTime: aiResult.processingTime || null
        });

      case "payment-webhook":
        const paymentResult = await intelligentWebhookJob.trigger(payload as SimpleWebhookPayload);
        return NextResponse.json({
          success: true,
          jobId: paymentResult.id,
          message: "Webhook inteligente processado",
          result: paymentResult.result || null
        });

      case "monthly-report":
        const reportResult = await intelligentReportJob.trigger();
        return NextResponse.json({
          success: true,
          jobId: reportResult.id,
          message: "Relatório inteligente iniciado",
          result: reportResult.result || null,
          processingTime: reportResult.processingTime || null
        });

      default:
        return NextResponse.json(
          { error: "Tipo de job não reconhecido" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Erro ao processar job do Trigger.dev:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
