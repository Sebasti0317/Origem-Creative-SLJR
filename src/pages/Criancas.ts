- import { Crianca } from '../types'
+ // Removido import de ../types para evitar erro de encoding

const schema = z.object({
  nome_completo: z.string().min(3, 'Mínimo 3 caracteres'),
  data_nascimento: z.string().min(1, 'Data obrigatória'),
  genero: z.enum(['masculino', 'feminino', 'outro', 'prefiro não dizer']),
  contacto_emergencia: z.string().optional(),
  estado: z.enum(['ativo', 'transitório', 'desligado']),
  observacoes_psicossociais: z.string().optional(),
  data_entrada: z.string().min(1, 'Data obrigatória'),
  data_saida: z.string().optional()
})

type FormValues = z.infer<typeof schema>

export default function CriancasForm({ onCancel }: { onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { estado: 'ativo', genero: 'masculino' }
  })

  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (values: FormValues) => createCrianca(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['criancas'] })
      toast.success('Criança registada com sucesso')
      onCancel()
    },
    onError: (e: any) => toast.error(e.message || 'Erro ao guardar')
  })

  const onSubmit = (data: FormValues) => mutation.mutate(data)

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Nova Criança</h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input {...register('nome_completo')} className="w-full border rounded px-3 py-2" />
            {errors.nome_completo && <p className="text-red-500 text-xs mt-1">{errors.nome_completo.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento *</label>
            <input type="date" {...register('data_nascimento')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Género *</label>
            <select {...register('genero')} className="w-full border rounded px-3 py-2">
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
              <option value="prefiro não dizer">Prefiro não dizer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contacto de Emergência</label>
            <input {...register('contacto_emergencia')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
            <select {...register('estado')} className="w-full border rounded px-3 py-2">
              <option value="ativo">Ativo</option>
              <option value="transitório">Transitório</option>
              <option value="desligado">Desligado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrada *</label>
            <input type="date" {...register('data_entrada')} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Saída</label>
            <input type="date" {...register('data_saida')} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações Psicossociais</label>
            <textarea {...register('observacoes_psicossociais')} rows={3} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}