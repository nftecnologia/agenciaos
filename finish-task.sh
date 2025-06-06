#!/bin/bash

# Script para finalizar tracking de uma subtask
# Uso: ./finish-task.sh SUBTASK-001.3

if [ $# -eq 0 ]; then
    echo "❌ Uso: ./finish-task.sh SUBTASK-XXX.X"
    exit 1
fi

SUBTASK=$1
TIMESTAMP=$(date '+%H:%M (%d/%m/%Y)')

echo "⏰ Finalizando tracking da $SUBTASK às $TIMESTAMP"

# Buscar horário de início no log
START_TIME=$(grep "START $SUBTASK" memory-bank/tracking/time-log.txt | tail -1 | cut -d']' -f1 | cut -d'[' -f2)

if [ -z "$START_TIME" ]; then
    echo "❌ Erro: Não encontrado horário de início para $SUBTASK"
    echo "💡 Use './start-task.sh $SUBTASK' primeiro"
    exit 1
fi

# Calcular tempo gasto (simplificado - assumindo mesmo dia)
START_HOUR=$(echo $START_TIME | cut -d':' -f1)
START_MIN=$(echo $START_TIME | cut -d':' -f2 | cut -d' ' -f1)
END_HOUR=$(date '+%H')
END_MIN=$(date '+%M')

START_TOTAL_MIN=$((START_HOUR * 60 + START_MIN))
END_TOTAL_MIN=$((END_HOUR * 60 + END_MIN))
DURATION_MIN=$((END_TOTAL_MIN - START_TOTAL_MIN))

if [ $DURATION_MIN -lt 60 ]; then
    DURATION_TEXT="${DURATION_MIN} minutos"
else
    HOURS=$((DURATION_MIN / 60))
    MINS=$((DURATION_MIN % 60))
    DURATION_TEXT="${HOURS}h ${MINS}min"
fi

echo "⏱️ Tempo gasto: $DURATION_TEXT"

# Atualizar arquivo de time tracking
sed -i '' "s/- \*\*⏰ Fim:\*\* \[A definir\]/- **⏰ Fim:** $TIMESTAMP/" memory-bank/tracking/time-tracking.md
sed -i '' "s/- \*\*⏱️ Tempo Real:\*\* \[Em andamento\]/- **⏱️ Tempo Real:** $DURATION_TEXT/" memory-bank/tracking/time-tracking.md
sed -i '' "s/- \*\*🔄 Status:\*\* Em andamento/- **✅ Status:** Concluído/" memory-bank/tracking/time-tracking.md

# Log no arquivo
echo "[$TIMESTAMP] FINISH $SUBTASK | Duration: $DURATION_TEXT" >> memory-bank/tracking/time-log.txt

echo "✅ Tracking finalizado para $SUBTASK"
echo "📊 Duração: $DURATION_TEXT"
echo "💡 Use './update-task-simple.sh $SUBTASK 0.25' para marcar como concluída" 