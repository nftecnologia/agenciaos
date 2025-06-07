import { NextRequest, NextResponse } from "next/server";
import { simpleAIJob, simpleWebhookJob, simpleReportJob } from "../../../trigger";
import type { SimpleAIPayload, SimpleWebhookPayload } from "../../../trigger";

export async function POST(request: NextRequest) {
  try {
    const { type, payload } = await request.json();

    switch (type) {
      case "ai-content":
        const aiResult = await simpleAIJob.trigger(payload as SimpleAIPayload);
        return NextResponse.json({
          success: true,
          jobId: aiResult.id,
          message: "Job de geração de conteúdo IA iniciado",
        });

      case "payment-webhook":
        const paymentResult = await simpleWebhookJob.trigger(payload as SimpleWebhookPayload);
        return NextResponse.json({
          success: true,
          jobId: paymentResult.id,
          message: "Webhook de pagamento processado",
        });

      case "monthly-report":
        const reportResult = await simpleReportJob.trigger();
        return NextResponse.json({
          success: true,
          jobId: reportResult.id,
          message: "Job de relatório mensal iniciado",
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
