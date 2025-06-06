#!/bin/bash

# Script para iniciar tracking de uma subtask
# Uso: ./start-task.sh SUBTASK-001.3

if [ $# -eq 0 ]; then
    echo "❌ Uso: ./start-task.sh SUBTASK-XXX.X"
    exit 1
fi

SUBTASK=$1
TIMESTAMP=$(date '+%H:%M (%d/%m/%Y)')
DATE_ONLY=$(date '+%d/%m/%Y')

echo "⏰ Iniciando tracking da $SUBTASK às $TIMESTAMP"

# Atualizar arquivo de time tracking
sed -i '' "s/- \*\*⏰ Início:\*\* \[A definir\]/- **⏰ Início:** $TIMESTAMP/" memory-bank/tracking/time-tracking.md
sed -i '' "s/- \*\*🔄 Status:\*\* Próximo/- **🔄 Status:** Em andamento/" memory-bank/tracking/time-tracking.md

# Log no arquivo
echo "[$TIMESTAMP] START $SUBTASK" >> memory-bank/tracking/time-log.txt

echo "✅ Tracking iniciado para $SUBTASK"
echo "💡 Use './finish-task.sh $SUBTASK' para finalizar" 