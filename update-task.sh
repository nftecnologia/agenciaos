#!/bin/bash
# update-task.sh

# Script para marcar subtask como concluída e calcular próximo passo
# Uso: ./update-task.sh SUBTASK-001.1 1.5

if [ $# -ne 2 ]; then
    echo "❌ Uso: $0 <SUBTASK-ID> <HORAS_GASTAS>"
    echo "   Exemplo: $0 SUBTASK-001.1 1.5"
    exit 1
fi

SUBTASK_ID="$1"
HOURS_SPENT="$2"
TASKS_FILE="memory-bank/context/tasks.md"

if [ ! -f "$TASKS_FILE" ]; then
    echo "❌ Arquivo tasks.md não encontrado"
    exit 1
fi

echo "✅ Marcando $SUBTASK_ID como concluída ($HOURS_SPENT horas)..."

# Backup do arquivo
cp "$TASKS_FILE" "$TASKS_FILE.backup"

# Marcar subtask como concluída
sed -i.bak "s/- \[ \] \*\*\[$SUBTASK_ID\]\*\*.*/- [x] **[$SUBTASK_ID]** - Concluído em ${HOURS_SPENT}h - ✅/" "$TASKS_FILE"

# Remover marcação de próximo passo da subtask concluída
sed -i.bak "s/- \[x\] \*\*\[$SUBTASK_ID\]\*\*.*🔄.*PRÓXIMO PASSO.*/- [x] **[$SUBTASK_ID]** - Concluído em ${HOURS_SPENT}h - ✅/" "$TASKS_FILE"

# Encontrar próxima subtask pendente na mesma task
TASK_PREFIX=$(echo "$SUBTASK_ID" | cut -d'.' -f1)
NEXT_SUBTASK=$(grep -A 20 "$TASK_PREFIX" "$TASKS_FILE" | grep "- \[ \]" | head -1 | grep -o "SUBTASK-[0-9]*\.[0-9]*")

if [ ! -z "$NEXT_SUBTASK" ]; then
    echo "🎯 Próxima subtask identificada: $NEXT_SUBTASK"
    
    # Marcar como próximo passo
    sed -i.bak "s/- \[ \] \*\*\[$NEXT_SUBTASK\]\*\*/- [ ] **[$NEXT_SUBTASK]** - 🔄 **PRÓXIMO PASSO**/" "$TASKS_FILE"
    
    echo "✅ $NEXT_SUBTASK marcada como próximo passo"
else
    echo "🎉 Todas as subtasks desta task foram concluídas!"
    
    # Verificar se há próxima task disponível
    CURRENT_TASK_NUM=$(echo "$TASK_PREFIX" | grep -o "[0-9]*")
    NEXT_TASK_NUM=$((CURRENT_TASK_NUM + 1))
    NEXT_TASK_ID=$(printf "TASK-%03d" $NEXT_TASK_NUM)
    
    # Procurar próxima task
    NEXT_TASK_SUBTASK=$(grep -A 10 "$NEXT_TASK_ID" "$TASKS_FILE" | grep "- \[ \]" | head -1 | grep -o "SUBTASK-[0-9]*\.[0-9]*")
    
    if [ ! -z "$NEXT_TASK_SUBTASK" ]; then
        echo "🚀 Próxima task disponível: $NEXT_TASK_SUBTASK"
        sed -i.bak "s/- \[ \] \*\*\[$NEXT_TASK_SUBTASK\]\*\*/- [ ] **[$NEXT_TASK_SUBTASK]** - 🔄 **PRÓXIMO PASSO**/" "$TASKS_FILE"
        echo "✅ $NEXT_TASK_SUBTASK marcada como próximo passo"
    else
        echo "🎊 Projeto concluído! Todas as tasks foram finalizadas!"
    fi
fi

# Recalcular progresso
if [ -f "./calculate-progress.sh" ]; then
    ./calculate-progress.sh
else
    echo "⚠️ Script calculate-progress.sh não encontrado"
fi

echo "✅ Task atualizada com sucesso!" 