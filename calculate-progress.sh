./status.sh#!/bin/bash
# calculate-progress.sh - Script atualizado para AgênciaOS SaaS

echo "🧮 Calculando progresso do projeto AgênciaOS SaaS..."

# Arquivos do Memory Bank
TASKS_FILE="memory-bank/context/tasks.md"
ACTIVE_CONTEXT="memory-bank/context/activecontext.md"
PROJECT_BRIEF="memory-bank/core/projectbrief.md"
TIME_TRACKING="memory-bank/tracking/time-tracking.md"

# Função para extrair dados das tasks
calculate_task_progress() {
    if [ ! -f "$TASKS_FILE" ]; then
        echo "❌ Arquivo tasks.md não encontrado"
        return 1
    fi
    
    echo "📊 Analisando progresso das tasks..."
    
    # Contar tasks principais concluídas vs total
    COMPLETED_TASKS=$(grep -c "✅ Concluído" "$TASKS_FILE" | head -1)
    TOTAL_TASKS=$(grep -c "### \[TASK-[0-9]*\]" "$TASKS_FILE")
    
    # Contar subtasks concluídas vs total
    COMPLETED_SUBTASKS=$(grep -c "\[x\].*SUBTASK.*✅" "$TASKS_FILE")
    TOTAL_SUBTASKS=$(grep -c "\[x\].*SUBTASK\|\[ \].*SUBTASK" "$TASKS_FILE")
    
    # Extrair horas do resumo geral
    ESTIMATED_HOURS=$(grep "⏱️ Tempo Total Estimado:" "$TASKS_FILE" | grep -o "[0-9]*" | head -1)
    COMPLETED_HOURS=$(grep "⏱️ Tempo Gasto:" "$TASKS_FILE" | grep -o "[0-9]*" | head -1)
    
    # Se não encontrou valores, usar padrões
    if [ -z "$ESTIMATED_HOURS" ] || [ "$ESTIMATED_HOURS" -eq 0 ]; then
        ESTIMATED_HOURS=105
    fi
    
    if [ -z "$COMPLETED_HOURS" ]; then
        COMPLETED_HOURS=0
    fi
    
    # Calcular percentuais
    if [ $TOTAL_TASKS -gt 0 ]; then
        TASK_PROGRESS=$((COMPLETED_TASKS * 100 / TOTAL_TASKS))
    else
        TASK_PROGRESS=0
    fi
    
    if [ $TOTAL_SUBTASKS -gt 0 ]; then
        SUBTASK_PROGRESS=$((COMPLETED_SUBTASKS * 100 / TOTAL_SUBTASKS))
    else
        SUBTASK_PROGRESS=0
    fi
    
    if [ $ESTIMATED_HOURS -gt 0 ]; then
        HOUR_PROGRESS=$((COMPLETED_HOURS * 100 / ESTIMATED_HOURS))
        REMAINING_HOURS=$((ESTIMATED_HOURS - COMPLETED_HOURS))
    else
        HOUR_PROGRESS=0
        REMAINING_HOURS=105
    fi
    
    echo "📈 Progresso Calculado:"
    echo "  Tasks Principais: $COMPLETED_TASKS/$TOTAL_TASKS ($TASK_PROGRESS%)"
    echo "  Subtasks: $COMPLETED_SUBTASKS/$TOTAL_SUBTASKS ($SUBTASK_PROGRESS%)"
    echo "  Horas: $COMPLETED_HOURS/$ESTIMATED_HOURS ($HOUR_PROGRESS%)"
    echo "  Restante: $REMAINING_HOURS horas"
    
    # Calcular progresso por fase
    calculate_phase_progress
    
    # Atualizar arquivos
    update_tasks_summary
    update_active_context
}

# Função para calcular progresso por fase
calculate_phase_progress() {
    echo ""
    echo "📊 Progresso por Fase:"
    
    # Fase 1: Fundação (TASK-001 a TASK-004)
    FASE1_COMPLETED=$(grep -c "✅ Concluído" "$TASKS_FILE" | grep -E "TASK-00[1-4]" | wc -l)
    FASE1_TOTAL=4
    FASE1_PROGRESS=$((FASE1_COMPLETED * 100 / FASE1_TOTAL))
    echo "  🔴 Fase 1 - Fundação: $FASE1_COMPLETED/$FASE1_TOTAL ($FASE1_PROGRESS%)"
    
    # Fase 2: Core Business (TASK-005 a TASK-008)
    FASE2_COMPLETED=$(grep -c "✅ Concluído" "$TASKS_FILE" | grep -E "TASK-00[5-8]" | wc -l)
    FASE2_TOTAL=4
    FASE2_PROGRESS=$((FASE2_COMPLETED * 100 / FASE2_TOTAL))
    echo "  🟡 Fase 2 - Core Business: $FASE2_COMPLETED/$FASE2_TOTAL ($FASE2_PROGRESS%)"
    
    # Fase 3: IA Engine (TASK-009 a TASK-012)
    FASE3_COMPLETED=$(grep -c "✅ Concluído" "$TASKS_FILE" | grep -E "TASK-0(09|1[0-2])" | wc -l)
    FASE3_TOTAL=4
    FASE3_PROGRESS=$((FASE3_COMPLETED * 100 / FASE3_TOTAL))
    echo "  🟢 Fase 3 - IA Engine: $FASE3_COMPLETED/$FASE3_TOTAL ($FASE3_PROGRESS%)"
    
    # Fase 4: Polimento (TASK-013 a TASK-015)
    FASE4_COMPLETED=$(grep -c "✅ Concluído" "$TASKS_FILE" | grep -E "TASK-01[3-5]" | wc -l)
    FASE4_TOTAL=3
    FASE4_PROGRESS=$((FASE4_COMPLETED * 100 / FASE4_TOTAL))
    echo "  🔵 Fase 4 - Polimento: $FASE4_COMPLETED/$FASE4_TOTAL ($FASE4_PROGRESS%)"
}

# Função para atualizar resumo no tasks.md
update_tasks_summary() {
    if [ ! -f "$TASKS_FILE" ]; then
        echo "❌ Arquivo tasks.md não encontrado para atualização"
        return 1
    fi
    
    # Backup do arquivo
    cp "$TASKS_FILE" "$TASKS_FILE.backup"
    
    # Atualizar progresso total
    sed -i.bak "s/\*\*📈 Progresso Total:\*\* [0-9]*% ([0-9]*\/[0-9]* tasks concluídas)/\*\*📈 Progresso Total:\*\* ${TASK_PROGRESS}% (${COMPLETED_TASKS}\/${TOTAL_TASKS} tasks concluídas)/" "$TASKS_FILE"
    
    # Atualizar tempo gasto
    sed -i.bak "s/\*\*⏱️ Tempo Gasto:\*\* [0-9]* horas/\*\*⏱️ Tempo Gasto:\*\* ${COMPLETED_HOURS} horas/" "$TASKS_FILE"
    
    # Atualizar tempo restante
    sed -i.bak "s/\*\*⏱️ Tempo Restante:\*\* [0-9]* horas (~[0-9]* dias úteis)/\*\*⏱️ Tempo Restante:\*\* ${REMAINING_HOURS} horas (~$((REMAINING_HOURS / 4)) dias úteis)/" "$TASKS_FILE"
    
    echo "✅ Resumo do tasks.md atualizado"
}

# Função para atualizar contexto ativo
update_active_context() {
    if [ ! -f "$ACTIVE_CONTEXT" ]; then
        echo "❌ Arquivo activecontext.md não encontrado"
        return 1
    fi
    
    # Backup do arquivo
    cp "$ACTIVE_CONTEXT" "$ACTIVE_CONTEXT.backup"
    
    # Atualizar progresso no activecontext.md
    sed -i.bak "s/\*\*Desenvolvimento:\*\* [0-9]*% ([0-9]* subtasks concluídas)/\*\*Desenvolvimento:\*\* ${SUBTASK_PROGRESS}% (${COMPLETED_SUBTASKS} subtasks concluídas)/" "$ACTIVE_CONTEXT"
    
    # Atualizar tempo real gasto
    sed -i.bak "s/\*\*Tempo Real Gasto:\*\* [0-9]* minutos/\*\*Tempo Real Gasto:\*\* $((COMPLETED_HOURS * 60)) minutos/" "$ACTIVE_CONTEXT"
    
    echo "✅ Contexto ativo atualizado"
}

# Função para encontrar próximo passo
find_next_step() {
    echo ""
    echo "🎯 Identificando próximo passo..."
    
    # Procurar por subtask em progresso ou próxima pendente
    CURRENT_TASK=$(grep -A 10 "🔄 Em Progresso" "$TASKS_FILE" | head -15)
    NEXT_SUBTASK=$(grep -A 2 "\[ \].*SUBTASK" "$TASKS_FILE" | head -3)
    
    if [ ! -z "$CURRENT_TASK" ]; then
        echo "📋 Task Ativa Encontrada:"
        echo "$CURRENT_TASK" | head -5
        echo ""
    fi
    
    if [ ! -z "$NEXT_SUBTASK" ]; then
        echo "🎯 Próxima Subtask:"
        echo "$NEXT_SUBTASK"
        
        # Extrair ID da subtask
        SUBTASK_ID=$(echo "$NEXT_SUBTASK" | grep -o "SUBTASK-[0-9]*\.[0-9]*" | head -1)
        if [ ! -z "$SUBTASK_ID" ]; then
            echo "  📝 ID: $SUBTASK_ID"
        fi
    else
        echo "⚠️ Nenhuma subtask pendente encontrada"
        echo "💡 Verifique se todas as tasks foram concluídas ou se há erro no formato"
    fi
}

# Função para gerar relatório de velocidade
generate_velocity_report() {
    echo ""
    echo "📈 Relatório de Velocidade:"
    
    # Data de início do projeto (06/01/2025 baseado no activecontext.md)
    START_DATE="06/01/2025"
    
    if [ ! -z "$START_DATE" ]; then
        # Calcular dias desde início (macOS compatible)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            START_TIMESTAMP=$(date -j -f "%d/%m/%Y" "$START_DATE" "+%s" 2>/dev/null || echo "0")
        else
            START_TIMESTAMP=$(date -d "$START_DATE" "+%s" 2>/dev/null || echo "0")
        fi
        
        CURRENT_TIMESTAMP=$(date "+%s")
        
        if [ $START_TIMESTAMP -gt 0 ]; then
            DAYS_ELAPSED=$(( (CURRENT_TIMESTAMP - START_TIMESTAMP) / 86400 ))
            WORK_DAYS_ELAPSED=$(( DAYS_ELAPSED + 1 )) # Incluir dia atual
            
            if [ $WORK_DAYS_ELAPSED -gt 0 ] && [ $COMPLETED_HOURS -gt 0 ]; then
                VELOCITY=$(echo "scale=1; $COMPLETED_HOURS / $WORK_DAYS_ELAPSED" | bc 2>/dev/null || echo "0")
                if [ $(echo "$VELOCITY > 0" | bc 2>/dev/null || echo "0") -eq 1 ]; then
                    REMAINING_WORK_DAYS=$(echo "scale=0; $REMAINING_HOURS / $VELOCITY" | bc 2>/dev/null || echo "26")
                else
                    REMAINING_WORK_DAYS=26
                fi
                
                echo "  📅 Dias decorridos: $DAYS_ELAPSED (~$WORK_DAYS_ELAPSED úteis)"
                echo "  ⚡ Velocidade atual: ${VELOCITY}h/dia útil"
                echo "  📊 Estimativa de conclusão: $REMAINING_WORK_DAYS dias úteis"
                
                # Calcular data estimada de conclusão
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    COMPLETION_DATE=$(date -v +${REMAINING_WORK_DAYS}d "+%d/%m/%Y")
                else
                    COMPLETION_DATE=$(date -d "+$REMAINING_WORK_DAYS days" "+%d/%m/%Y")
                fi
                echo "  🎯 Data estimada: $COMPLETION_DATE"
            else
                echo "  📅 Projeto iniciado recentemente"
                echo "  ⚡ Velocidade será calculada após primeiras horas registradas"
                echo "  📊 Estimativa inicial: 26 dias úteis (4h/dia)"
                echo "  🎯 Data estimada: 31/01/2025"
            fi
        fi
    fi
}

# Função para verificar marcos do projeto
check_milestones() {
    echo ""
    echo "🎯 Status dos Marcos:"
    
    # Marco 1: Fundação (10/01/2025)
    MARCO1_TASKS=$(grep -c "✅ Concluído" "$TASKS_FILE" | grep -E "TASK-00[1-4]" | wc -l)
    MARCO1_PROGRESS=$((MARCO1_TASKS * 100 / 4))
    echo "  🔴 Marco 1 - Fundação (10/01): $MARCO1_PROGRESS% ($MARCO1_TASKS/4 tasks)"
    
    # Marco 2: Core Business (20/01/2025)
    MARCO2_TASKS=$(grep -c "✅ Concluído" "$TASKS_FILE" | grep -E "TASK-00[5-8]" | wc -l)
    MARCO2_PROGRESS=$((MARCO2_TASKS * 100 / 4))
    echo "  🟡 Marco 2 - Core Business (20/01): $MARCO2_PROGRESS% ($MARCO2_TASKS/4 tasks)"
    
    # Marco 3: IA Engine (28/01/2025)
    MARCO3_TASKS=$(grep -c "✅ Concluído" "$TASKS_FILE" | grep -E "TASK-0(09|1[0-2])" | wc -l)
    MARCO3_PROGRESS=$((MARCO3_TASKS * 100 / 4))
    echo "  🟢 Marco 3 - IA Engine (28/01): $MARCO3_PROGRESS% ($MARCO3_TASKS/4 tasks)"
    
    # Marco 4: Produto Final (31/01/2025)
    MARCO4_TASKS=$(grep -c "✅ Concluído" "$TASKS_FILE" | grep -E "TASK-01[3-5]" | wc -l)
    MARCO4_PROGRESS=$((MARCO4_TASKS * 100 / 3))
    echo "  🔵 Marco 4 - Produto Final (31/01): $MARCO4_PROGRESS% ($MARCO4_TASKS/3 tasks)"
}

# Função para atualizar timestamp
update_timestamp() {
    CURRENT_TIME=$(date "+%d/%m/%Y %H:%M")
    echo "🕒 Progresso calculado em: $CURRENT_TIME"
    echo "💡 Para atualizar timestamps manualmente, edite os arquivos:"
    echo "  - memory-bank/context/tasks.md"
    echo "  - memory-bank/context/activecontext.md"
}

# Executar todas as funções
echo "🚀 Iniciando cálculo de progresso..."
echo ""

calculate_task_progress
find_next_step
generate_velocity_report
check_milestones
update_timestamp

echo ""
echo "🎉 Cálculo de progresso concluído!"
echo "📝 Arquivos atualizados:"
echo "  - memory-bank/context/tasks.md"
echo "  - memory-bank/context/activecontext.md"
echo ""
echo "💡 Use './status.sh' para ver um resumo rápido do progresso" 