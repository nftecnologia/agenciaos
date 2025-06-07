import { task } from "@trigger.dev/sdk/v3";
import { db } from "@/lib/db";

export const generateMonthlyReports = task({
  id: "generate-monthly-reports",
  maxDuration: 600, // 10 minutos
  retry: {
    maxAttempts: 2,
  },
  run: async () => {
    console.log("Iniciando geração de relatórios mensais");

    try {
      // Buscar todas as agências ativas
      const agencies = await db.agency.findMany({
        where: {
          plan: {
            in: ["FREE", "PRO"],
          },
        },
        include: {
          revenues: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          },
          expenses: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          },
          aiUsage: {
            where: {
              createdAt: {
                gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
                lt: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              },
            },
          },
        },
      });

      const reports = [];

      for (const agency of agencies) {
        const totalRevenue = agency.revenues.reduce(
          (sum, revenue) => sum + Number(revenue.amount),
          0
        );
        const totalExpenses = agency.expenses.reduce(
          (sum, expense) => sum + Number(expense.amount),
          0
        );
        const totalAIUsage = agency.aiUsage.reduce(
          (sum, usage) => sum + usage.tokensUsed,
          0
        );

        const report = {
          agencyId: agency.id,
          agencyName: agency.name,
          plan: agency.plan,
          totalRevenue,
          totalExpenses,
          profit: totalRevenue - totalExpenses,
          totalAIUsage,
          month: new Date().getMonth(),
          year: new Date().getFullYear(),
        };

        reports.push(report);

        console.log(`Relatório gerado para ${agency.name}: Receita R$ ${totalRevenue}, Lucro R$ ${report.profit}`);
      }

      console.log(`Relatórios mensais gerados para ${reports.length} agências`);

      return {
        success: true,
        reportsGenerated: reports.length,
        reports: reports.slice(0, 5), // Retorna apenas os primeiros 5 para não sobrecarregar o log
      };
    } catch (error) {
      console.error("Erro na geração de relatórios mensais:", error);
      throw error;
    }
  },
});

// TODO: Implementar scheduled task quando a API estiver disponível
// Scheduled task para executar todo dia 1 às 09:00
// Pode ser executado manualmente ou via cron job externo
