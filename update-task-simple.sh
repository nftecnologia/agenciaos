#!/bin/bash
# update-task-simple.sh

# Script simplificado para marcar subtask como concluída
# Uso: ./update-task-simple.sh SUBTASK-001.1 1.5

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

# Usar uma abordagem mais simples com awk
awk -v subtask="$SUBTASK_ID" -v hours="$HOURS_SPENT" '
{
    if ($0 ~ "\\[" subtask "\\]" && $0 ~ "🔄.*PRÓXIMO PASSO") {
        # Marcar como concluída e remover próximo passo
        gsub(/- \[ \]/, "- [x]")
        gsub(/🔄.*PRÓXIMO PASSO.*/, "Concluído em " hours "h - ✅")
        print $0
    } else if ($0 ~ "\\[" subtask "\\]" && $0 ~ "- \\[ \\]") {
        # Marcar como concluída
        gsub(/- \[ \]/, "- [x]")
        gsub(/Est: [0-9]*h/, "Concluído em " hours "h - ✅")
        print $0
    } else {
        print $0
    }
}' "$TASKS_FILE" > "$TASKS_FILE.tmp" && mv "$TASKS_FILE.tmp" "$TASKS_FILE"

echo "✅ $SUBTASK_ID marcada como concluída!"

# Encontrar próxima subtask na mesma task
TASK_PREFIX=$(echo "$SUBTASK_ID" | cut -d'.' -f1)
echo "🔍 Procurando próxima subtask em $TASK_PREFIX..."

# Usar grep mais simples para encontrar próxima subtask
NEXT_SUBTASK=$(grep -A 20 "### \[$TASK_PREFIX\]" "$TASKS_FILE" | grep "- \[ \]" | head -1 | grep -o "SUBTASK-[0-9]*\.[0-9]*")

if [ ! -z "$NEXT_SUBTASK" ]; then
    echo "🎯 Próxima subtask identificada: $NEXT_SUBTASK"
    
    # Marcar próxima subtask como próximo passo
    awk -v next="$NEXT_SUBTASK" '
    {
        if ($0 ~ "\\[" next "\\]" && $0 ~ "- \\[ \\]") {
            gsub(/Est: [0-9]*h/, "🔄 **PRÓXIMO PASSO** - Est: 1h")
            print $0
        } else {
            print $0
        }
    }' "$TASKS_FILE" > "$TASKS_FILE.tmp" && mv "$TASKS_FILE.tmp" "$TASKS_FILE"
    
    echo "✅ $NEXT_SUBTASK marcada como próximo passo"
else
    echo "🎉 Task $TASK_PREFIX concluída! Procurando próxima task..."
    
    # Procurar próxima task
    CURRENT_TASK_NUM=$(echo "$TASK_PREFIX" | grep -o "[0-9]*")
    NEXT_TASK_NUM=$((CURRENT_TASK_NUM + 1))
    NEXT_TASK_ID=$(printf "TASK-%03d" $NEXT_TASK_NUM)
    
    NEXT_TASK_SUBTASK=$(grep -A 10 "### \[$NEXT_TASK_ID\]" "$TASKS_FILE" | grep "- \[ \]" | head -1 | grep -o "SUBTASK-[0-9]*\.[0-9]*")
    
    if [ ! -z "$NEXT_TASK_SUBTASK" ]; then
        echo "🚀 Próxima task disponível: $NEXT_TASK_SUBTASK"
        
        # Marcar primeira subtask da próxima task
        awk -v next="$NEXT_TASK_SUBTASK" '
        {
            if ($0 ~ "\\[" next "\\]" && $0 ~ "- \\[ \\]") {
                gsub(/Est: [0-9]*h/, "🔄 **PRÓXIMO PASSO** - Est: 1h")
                print $0
            } else {
                print $0
            }
        }' "$TASKS_FILE" > "$TASKS_FILE.tmp" && mv "$TASKS_FILE.tmp" "$TASKS_FILE"
        
        echo "✅ $NEXT_TASK_SUBTASK marcada como próximo passo"
    else
        echo "🎊 Projeto concluído! Todas as tasks foram finalizadas!"
    fi
fi

# Recalcular progresso
if [ -f "./calculate-progress.sh" ]; then
    echo "📊 Recalculando progresso..."
    ./calculate-progress.sh
else
    echo "⚠️ Script calculate-progress.sh não encontrado"
fi

echo "✅ Task atualizada com sucesso!" 