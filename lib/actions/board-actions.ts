'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Supabase DB Actions
export async function saveEvidenceBoard(caseId: string, nodes: any[], edges: any[]) {
  try {
    const supabase = await createClient()

    const isUuid = (str: string) => 
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)

    // 1. Format Nodes với UUID hợp lệ
    const formattedNodes = nodes.map(n => {
      const nodeId = isUuid(n.id) ? n.id : crypto.randomUUID()
      return {
        id: nodeId,
        case_id: caseId,
        type: n.type,
        position_x: n.position.x,
        position_y: n.position.y,
        label: n.data?.label || '',
        description: n.data?.description || '',
        category: n.data?.category || '',
        logic_data: n.data || {}
      }
    })

    const nodeIds = formattedNodes.map(n => n.id)

    // 2. Xóa các nodes không còn tồn tại
    if (nodeIds.length > 0) {
      await supabase.from('evidence_nodes').delete().eq('case_id', caseId).not('id', 'in', `(${nodeIds.join(',')})`)
    } else {
      await supabase.from('evidence_nodes').delete().eq('case_id', caseId)
    }

    // 3. Upsert Nodes
    if (formattedNodes.length > 0) {
      const { error: nodeError } = await supabase.from('evidence_nodes').upsert(formattedNodes, { onConflict: 'id' })
      if (nodeError) throw nodeError
    }

    // 4. Format Edges
    const formattedEdges = edges.map(e => {
      const edgeId = e.id && isUuid(e.id) ? e.id : crypto.randomUUID()
      return {
        id: edgeId,
        case_id: caseId,
        source_node_id: e.source,
        target_node_id: e.target
      }
    })

    const edgeIds = formattedEdges.map(e => e.id)

    // 5. Xóa các edges không còn tồn tại
    if (edgeIds.length > 0) {
      await supabase.from('evidence_edges').delete().eq('case_id', caseId).not('id', 'in', `(${edgeIds.join(',')})`)
    } else {
      await supabase.from('evidence_edges').delete().eq('case_id', caseId)
    }

    // 6. Upsert Edges
    if (formattedEdges.length > 0) {
      const { error: edgeError } = await supabase.from('evidence_edges').upsert(formattedEdges, { onConflict: 'id' })
      if (edgeError) throw edgeError
    }

    revalidatePath(`/studio/cases/${caseId}/evidence`)
    return { success: true }
  } catch (error: any) {
    console.error('Error saving evidence board:', error)
    return { success: false, error: error.message }
  }
}

export async function getEvidenceBoard(caseId: string) {
  try {
    const supabase = await createClient()

    const { data: nodesData, error: nodeError } = await supabase
      .from('evidence_nodes')
      .select('*')
      .eq('case_id', caseId)

    if (nodeError) throw nodeError

    const { data: edgesData, error: edgeError } = await supabase
      .from('evidence_edges')
      .select('*')
      .eq('case_id', caseId)

    if (edgeError) throw edgeError

    // Reconstruct React Flow format
    const nodes = (nodesData || []).map(n => ({
      id: n.id,
      type: n.type,
      position: { x: n.position_x, y: n.position_y },
      data: {
        ...n.logic_data,
        label: n.label,
        description: n.description,
        category: n.category
      }
    }))

    const edges = (edgesData || []).map(e => {
      const sourceNode = nodes.find(n => n.id === e.source_node_id)
      const targetNode = nodes.find(n => n.id === e.target_node_id)
      const isCoreToCore = sourceNode?.type === 'question' && targetNode?.type === 'question'

      return {
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        sourceHandle: 'source-center',
        targetHandle: 'target',
        type: 'straight',
        animated: !isCoreToCore,
        style: isCoreToCore 
          ? { stroke: '#f43f5e', strokeWidth: 2 } 
          : { stroke: '#e4e4e7', strokeWidth: 2, strokeDasharray: '5,5' }
      }
    })

    return { success: true, nodes, edges }
  } catch (error: any) {
    console.error('Error fetching evidence board:', error)
    return { success: false, error: error.message, nodes: [], edges: [] }
  }
}
