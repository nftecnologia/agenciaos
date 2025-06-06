#!/bin/bash
# status.sh - Dashboard rápido do projeto AgenciaOS

echo "📊 DASHBOARD AGENCIAOS - $(date '+%d/%m/%Y %H:%M')"
echo "=================================================="

# Progresso geral
TASKS_FILE="memory-bank/context/tasks.md"
COMPLETED_TASKS=$(grep -c "✅" "$TASKS_FILE" 2>/dev/null || echo "0")
TOTAL_TASKS=$(grep -c "### \[TASK-" "$TASKS_FILE" 2>/dev/null || echo "8")
PROGRESS=$((COMPLETED_TASKS * 100 / TOTAL_TASKS))

echo "🎯 PROGRESSO GERAL: $PROGRESS% ($COMPLETED_TASKS/$TOTAL_TASKS tasks)"

# Próximo passo
NEXT_STEP=$(grep -A 1 "🔄 \*\*PRÓXIMO PASSO\*\*" "$TASKS_FILE" | head -2)
if [ ! -z "$NEXT_STEP" ]; then
    NEXT_ID=$(echo "$NEXT_STEP" | grep -o "SUBTASK-[0-9]*\.[0-9]*")
    NEXT_DESC=$(echo "$NEXT_STEP" | sed 's/.*\] - //' | sed 's/ - 🔄.*//')
    echo "⚡ PRÓXIMO PASSO: [$NEXT_ID] $NEXT_DESC"
else
    echo "❌ PRÓXIMO PASSO: NÃO DEFINIDO"
fi

# Horas trabalhadas
COMPLETED_HOURS=$(grep "✅" "$TASKS_FILE" | grep -o "[0-9]*h" | sed 's/h//' | awk '{sum+=$1} END {print sum+0}')
ESTIMATED_HOURS=64
REMAINING_HOURS=$((ESTIMATED_HOURS - COMPLETED_HOURS))
echo "⏱️ PROGRESSO HORAS: ${COMPLETED_HOURS}h/${ESTIMATED_HOURS}h (${REMAINING_HOURS}h restantes)"

# Task ativa
ACTIVE_TASK=$(grep -B 2 -A 1 "🔄 Em Progresso" "$TASKS_FILE" | head -3)
if [ ! -z "$ACTIVE_TASK" ]; then
    TASK_NAME=$(echo "$ACTIVE_TASK" | grep "### \[TASK-" | sed 's/.*\] - //')
    echo "🔄 TASK ATIVA: $TASK_NAME"
else
    echo "🔄 TASK ATIVA: Setup Inicial do Projeto"
fi

# Bloqueios ativos
BLOCKERS=$(grep -c "Pendente" "memory-bank/context/activecontext.md" 2>/dev/null | head -1 || echo "0")
if [ "$BLOCKERS" = "0" ]; then
    echo "✅ SEM BLOQUEIOS"
else
    echo "🚫 BLOQUEIOS ATIVOS: $BLOCKERS"
fi

# Estimativa de conclusão
if [ "$COMPLETED_HOURS" -gt "0" ]; then
    # Calcular velocidade baseada em dias trabalhados
    START_DATE="27/12/2024"
    START_TIMESTAMP=$(date -j -f "%d/%m/%Y" "$START_DATE" "+%s" 2>/dev/null || echo "0")
    CURRENT_TIMESTAMP=$(date "+%s")
    DAYS_ELAPSED=$(( (CURRENT_TIMESTAMP - START_TIMESTAMP) / 86400 + 1 ))
    
    VELOCITY=$(( COMPLETED_HOURS / DAYS_ELAPSED ))
    if [ "$VELOCITY" -gt "0" ]; then
        REMAINING_DAYS=$(( REMAINING_HOURS / VELOCITY ))
        COMPLETION_DATE=$(date -v +${REMAINING_DAYS}d "+%d/%m/%Y")
        echo "📅 ESTIMATIVA CONCLUSÃO: $COMPLETION_DATE ($REMAINING_DAYS dias)"
    else
        echo "📅 ESTIMATIVA CONCLUSÃO: 20/01/2025 (baseline)"
    fi
else
    echo "📅 ESTIMATIVA CONCLUSÃO: 20/01/2025 (baseline)"
fi

echo "=================================================="
echo "💡 Comandos úteis:"
echo "   ./calculate-progress.sh  - Calcular progresso detalhado"
echo "   ./update-task.sh SUBTASK-XXX.X 1.5  - Marcar subtask como concluída"
echo ""
echo "🚀 Para começar: execute o próximo passo listado acima!" 