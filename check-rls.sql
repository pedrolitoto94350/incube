-- Vérifier quelles tables n'ont pas RLS activé
SELECT
    t.tablename,
    t.tableowner,
    CASE WHEN p.relrowsecurity THEN '✅ RLS activé' ELSE '❌ RLS désactivé' END as rls_status
FROM pg_tables t
JOIN pg_class p ON t.tablename = p.relname
WHERE t.schemaname = 'public'
  AND t.tablename NOT IN ('_prisma_migrations', 'schema_migrations', 'spatial_ref_sys')
ORDER BY t.tablename;
