#!/bin/bash

# Script para mostrar tempo atual e status das tasks
# Uso: ./current-time.sh

CURRENT_TIME=$(date '+%H:%M (%d/%m/%Y)')
echo "🕐 Horário Atual: $CURRENT_TIME"
echo ""

# Verificar se há task em andamento
if [ -f "memory-bank/tracking/time-log.txt" ]; then
    LAST_ACTION=$(tail -1 memory-bank/tracking/time-log.txt)
    
    if echo "$LAST_ACTION" | grep -q "START"; then
        CURRENT_TASK=$(echo "$LAST_ACTION" | grep -o "SUBTASK-[0-9]*\.[0-9]*")
        START_TIME=$(echo "$LAST_ACTION" | cut -d']' -f1 | cut -d'[' -f2)
        
        # Calcular tempo decorrido
        START_HOUR=$(echo $START_TIME | cut -d':' -f1)
        START_MIN=$(echo $START_TIME | cut -d':' -f2 | cut -d' ' -f1)
        CURRENT_HOUR=$(date '+%H')
        CURRENT_MIN=$(date '+%M')
        
        START_TOTAL_MIN=$((START_HOUR * 60 + START_MIN))
        CURRENT_TOTAL_MIN=$((CURRENT_HOUR * 60 + CURRENT_MIN))
        ELAPSED_MIN=$((CURRENT_TOTAL_MIN - START_TOTAL_MIN))
        
        if [ $ELAPSED_MIN -lt 60 ]; then
            ELAPSED_TEXT="${ELAPSED_MIN} minutos"
        else
            HOURS=$((ELAPSED_MIN / 60))
            MINS=$((ELAPSED_MIN % 60))
            ELAPSED_TEXT="${HOURS}h ${MINS}min"
        fi
        
        echo "🔄 Task em Andamento: $CURRENT_TASK"
        echo "⏰ Iniciada às: $START_TIME"
        echo "⏱️ Tempo Decorrido: $ELAPSED_TEXT"
        echo ""
        echo "💡 Use './finish-task.sh $CURRENT_TASK' para finalizar"
    else
        echo "✅ Nenhuma task em andamento"
        echo "💡 Use './start-task.sh SUBTASK-XXX.X' para iniciar uma nova"
    fi
else
    echo "📝 Nenhum log de tempo encontrado"
    echo "💡 Use './start-task.sh SUBTASK-XXX.X' para começar"
fi

echo ""
echo "📊 Comandos Disponíveis:"
echo "  ./start-task.sh SUBTASK-XXX.X  - Iniciar tracking"
echo "  ./finish-task.sh SUBTASK-XXX.X - Finalizar tracking"
echo "  ./status.sh                    - Ver status geral" 