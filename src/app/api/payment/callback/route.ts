import { NextRequest, NextResponse } from 'next/server';

const GATEWAY_BASE_URL = 'https://pay.dev.aliancaseguros.cv';
const GATEWAY_CLIENT_ID = '4224339E02544A5EA6D1B6C6D9443CCA';


async function tryValidateHmac(options: {
  reference: string;
  fingerprint: string;
  accessToken?: string;
}): Promise<{ ok: boolean; status: number; text: string }> {
  const { reference, fingerprint, accessToken } = options;
  const url = `${GATEWAY_BASE_URL}/api/v1/pagamentos/validar-hmac`;
  const payload = { reference, hmacFingerprint: fingerprint };
  console.log('[HMAC] ->', payload);
  // 1) Authorization: Bearer {token}
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': GATEWAY_CLIENT_ID,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (res.ok || !accessToken) {
    return { ok: res.ok, status: res.status, text: await res.text().catch(() => '') };
  }
  // 1.1) Tentar normalizar '+' (caso tenha virado espaço)
  const normalizedFp = fingerprint.replace(/\s+/g, '+');
  if (normalizedFp !== fingerprint) {
    const res1b = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ reference, hmacFingerprint: normalizedFp }),
      cache: 'no-store',
    });
    if (res1b.ok) {
      return { ok: true, status: res1b.status, text: await res1b.text().catch(() => '') };
    }
  }
  // 2) Authorization: {token} (sem Bearer)
  const res2 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': GATEWAY_CLIENT_ID,
      Authorization: accessToken,
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  if (res2.ok) {
    return { ok: true, status: res2.status, text: await res2.text().catch(() => '') };
  }
  // 3) accessToken no cabeçalho dedicado
  const res3 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': GATEWAY_CLIENT_ID,
      accessToken: accessToken,
    } as Record<string, string>,
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  return { ok: res3.ok, status: res3.status, text: await res3.text().catch(() => '') };
}

// GET não é necessário - SISP envia diretamente via POST

export async function POST(request: NextRequest) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 [PAYMENT CALLBACK][POST] INICIANDO CALLBACK DO SISP');
  console.log('═══════════════════════════════════════════════════════════════');
  
  try {
    // Log de headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log('📨 [CALLBACK] Headers recebidos:', JSON.stringify(headers, null, 2));
    
    let body: Record<string, string> = {};
    const contentType = request.headers.get('content-type') || '';
    console.log('📋 [CALLBACK] Content-Type:', contentType);
    
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      console.log('📝 [CALLBACK] Processando como FormData');
      const form = await request.formData();
      form.forEach((value, key) => {
        body[key] = typeof value === 'string' ? value : '';
      });
    } else if (contentType.includes('application/json')) {
      console.log('📝 [CALLBACK] Processando como JSON');
      const json = await request.json();
      body = json as Record<string, string>;
    } else {
      console.log('📝 [CALLBACK] Tentando JSON como fallback');
      try {
        body = await request.json();
      } catch (e) {
        console.error('❌ [CALLBACK] Falha ao ler body:', e);
        body = {};
      }
    }
    
    console.log('📦 [CALLBACK] Body completo recebido do SISP:', JSON.stringify(body, null, 2));
    
    const {
      reference,
      amount,
      merchantRef,
      fingerprint,
      reciboRef: reciboRefBody,
      status: sispStatus, // Status do SISP
    } = body;

    console.log('📊 [CALLBACK] Dados extraídos:', {
      reference,
      merchantRef,
      amount,
      sispStatus,
      reciboRef: reciboRefBody,
      fingerprint: fingerprint ? fingerprint.substring(0, 30) + '...' : 'N/A'
    });

    // SERVER-SIDE: Só valida HMAC se o SISP retornou sucesso
    const refPost = (reference || merchantRef || '').toString().trim();
    const fpPost = (body.hmacFingerprint || fingerprint || '').toString(); // mantém como veio
    let serverStatus = 'error';
    let serverMessage = 'Pagamento não processado';
    let collectStatus = 'skipped';
    let collectMessage = '';

    console.log('🔍 [CALLBACK] Verificando status do SISP...');
    console.log('🔍 [CALLBACK] sispStatus recebido:', sispStatus);
    console.log('🔍 [CALLBACK] Valores aceitos: "success" ou "approved"');
    
    // Verificar se o SISP retornou sucesso
    if (sispStatus !== 'success' && sispStatus !== 'approved') {
      serverStatus = 'error';
      serverMessage = `Pagamento rejeitado pelo SISP: ${sispStatus || 'status desconhecido'}`;
      console.log('❌ [CALLBACK] SISP NÃO RETORNOU SUCESSO!');
      console.log('❌ [CALLBACK] Status recebido:', sispStatus);
      console.log('❌ [CALLBACK] serverStatus:', serverStatus);
      console.log('❌ [CALLBACK] serverMessage:', serverMessage);
    } else {
      console.log('✅ [CALLBACK] SISP retornou sucesso!');
      console.log('✅ [CALLBACK] Iniciando validação HMAC...');
      // SISP retornou sucesso, agora validar HMAC
      try {
        const gatewayToken = request.cookies.get('pay_token')?.value || '';
        console.log('🔑 [CALLBACK] Lendo token de pagamento...');
        console.log('🔑 [CALLBACK] pay_token:', gatewayToken ? `presente (${gatewayToken.substring(0, 20)}...)` : 'AUSENTE');
        console.log('🔑 [CALLBACK] Preparando validação HMAC...');
        console.log('🔑 [CALLBACK] reference:', refPost);
        console.log('🔑 [CALLBACK] fingerprint:', fpPost ? fpPost.substring(0, 30) + '...' : 'N/A');
        
        const attempt = await tryValidateHmac({ 
          reference: refPost, 
          fingerprint: fpPost, 
          accessToken: gatewayToken 
        });
        
        console.log('📡 [CALLBACK] Resposta da validação HMAC:', {
          ok: attempt.ok,
          status: attempt.status,
          text: attempt.text
        });
        
        if (!attempt.ok) {
          console.error('❌ [CALLBACK] VALIDAÇÃO HMAC FALHOU!');
          console.error('❌ [CALLBACK] Status HTTP:', attempt.status);
          console.error('❌ [CALLBACK] Resposta:', attempt.text);
          serverStatus = 'error';
          serverMessage = `Validação HMAC falhou (${attempt.status})`;
        } else {
          serverStatus = 'ok';
          serverMessage = 'HMAC válido';
          console.log('✅ [CALLBACK] HMAC VALIDADO COM SUCESSO!');
          console.log('✅ [CALLBACK] Iniciando cobrança do recibo...');
          
          // HMAC válido, agora cobrar o recibo
          if (merchantRef && amount) {
            const receiptRef = reciboRefBody || request.cookies.get('recibo_ref')?.value || refPost;
            const collectUrl = `https://aliancacvtest.rtcom.pt/anywhere/api/v1/private/mobile/invoice/${merchantRef}/collect`;
            const collectBody = {
              value: Number(amount),
              reference: receiptRef || merchantRef,
              sendEmail: false,
              apiName: 'WebsiteCollection',
            };
            
            const anywhereBearerPost = request.cookies.get('anywhere_token')?.value;
            console.log('💰 [CALLBACK] Preparando cobrança...');
            console.log('💰 [CALLBACK] URL:', collectUrl);
            console.log('💰 [CALLBACK] Body:', JSON.stringify(collectBody, null, 2));
            console.log('💰 [CALLBACK] anywhere_token:', anywhereBearerPost ? `presente (${anywhereBearerPost.substring(0, 20)}...)` : 'AUSENTE');
            
            const collectRes = await fetch(collectUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(anywhereBearerPost ? { Authorization: `Bearer ${anywhereBearerPost}` } : {}),
              },
              body: JSON.stringify(collectBody),
              cache: 'no-store',
            });
            
            console.log('📡 [CALLBACK] Resposta da API de cobrança:', {
              status: collectRes.status,
              ok: collectRes.ok,
              statusText: collectRes.statusText
            });
            
            try {
              const contentType = collectRes.headers.get('content-type') || '';
              let respBody: unknown = null;
              if (contentType.includes('application/json')) {
                respBody = await collectRes.json();
              } else {
                const text = await collectRes.text();
                respBody = text.length > 300 ? text.slice(0, 300) : text;
              }
              console.log('📄 [CALLBACK] Body da resposta:', JSON.stringify(respBody, null, 2));
            } catch (e) {
              console.log('⚠️ [CALLBACK] Erro ao ler body da resposta:', e);
            }
            
            collectStatus = collectRes.ok ? 'ok' : 'error';
            collectMessage = collectRes.ok ? 'Cobrança confirmada com sucesso' : `Falha ao cobrar (${collectRes.status})`;
            
            if (collectRes.ok) {
              console.log('✅ [CALLBACK] COBRANÇA REALIZADA COM SUCESSO!');
            } else {
              console.error('❌ [CALLBACK] FALHA NA COBRANÇA!');
              console.error('❌ [CALLBACK] Status:', collectRes.status);
              console.error('❌ [CALLBACK] Mensagem:', collectMessage);
            }
          } else {
            console.log('⚠️ [CALLBACK] Cobrança não realizada - dados insuficientes');
            console.log('⚠️ [CALLBACK] merchantRef:', merchantRef);
            console.log('⚠️ [CALLBACK] amount:', amount);
          }
        }
      } catch (error) {
        console.error('[PAYMENT CALLBACK][POST] Erro ao validar/cobrar:', error);
        serverStatus = 'error';
        serverMessage = 'Erro no servidor ao validar/cobrar';
      }
    }

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎯 [CALLBACK] PREPARANDO REDIRECIONAMENTO');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📊 [CALLBACK] Resultado final:');
    console.log('   - serverStatus:', serverStatus);
    console.log('   - serverMessage:', serverMessage);
    console.log('   - collectStatus:', collectStatus);
    console.log('   - collectMessage:', collectMessage);
    console.log('   - merchantRef:', merchantRef);
    console.log('   - amount:', amount);
    
    // Redireciona para a página de recibos com resultado do servidor
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('server_status', serverStatus);
    redirectUrl.searchParams.set('server_message', serverMessage);
    redirectUrl.searchParams.set('collect_status', collectStatus);
    if (collectMessage) redirectUrl.searchParams.set('collect_message', collectMessage);
    redirectUrl.searchParams.set('merchantRef', merchantRef || '');
    redirectUrl.searchParams.set('amount', amount?.toString() || '');
    
    // Em caso de erro, devolve os dados usados para HMAC via query string (debug)
    if (serverStatus !== 'ok') {
      try {
        redirectUrl.searchParams.set('debug_ref', (refPost));
        redirectUrl.searchParams.set('debug_fp', (fpPost));
      } catch {}
    }

    console.log('🔗 [CALLBACK] URL COMPLETA DE REDIRECIONAMENTO:');
    console.log('🔗 [CALLBACK]', redirectUrl.toString());
    console.log('🔗 [CALLBACK] Parâmetros individuais:');
    redirectUrl.searchParams.forEach((value, key) => {
      console.log(`   ✓ ${key} = ${value}`);
    });
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ [CALLBACK] CALLBACK FINALIZADO - REDIRECIONANDO...');
    console.log('═══════════════════════════════════════════════════════════════');

    const res = NextResponse.redirect(redirectUrl, 303);
    
    // Salvar dados do pagamento em cookie para o modal ler
    const paymentResult = {
      serverStatus,
      serverMessage,
      collectStatus,
      collectMessage,
      merchantRef: merchantRef || '',
      amount: amount?.toString() || '',
      debugRef: serverStatus !== 'ok' ? refPost : '',
      debugFp: serverStatus !== 'ok' ? fpPost.substring(0, 50) : '',
    };
    
    res.cookies.set('payment_result', JSON.stringify(paymentResult), {
      path: '/',
      maxAge: 30, // 30 segundos
      sameSite: 'lax',
      secure: true,
    });
    
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'none',
      secure: true,
    });
    
    // Limpa o gateway token curto após uso
    res.cookies.set('pay_token', '', {
      path: '/',
      maxAge: 0,
      sameSite: 'none',
      secure: true,
    });
    
    console.log('🍪 [CALLBACK] Cookie payment_result criado:', paymentResult);
    
    return res;
  } catch (error) {
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('❌❌❌ [CALLBACK] ERRO NO CALLBACK POST ❌❌❌');
    console.error('═══════════════════════════════════════════════════════════════');
    console.error('[CALLBACK] Erro:', error);
    console.error('[CALLBACK] Stack:', error instanceof Error ? error.stack : 'N/A');
    
    // Em caso de erro, redireciona para a página de recibos
    const redirectUrl = new URL('/backoffice', request.url);
    redirectUrl.searchParams.set('menu', 'recibo');
    redirectUrl.searchParams.set('server_status', 'error');
    redirectUrl.searchParams.set('server_message', 'Erro ao processar callback');
    redirectUrl.searchParams.set('collect_status', 'skipped');
    
    console.error('🔗 [CALLBACK] URL de redirecionamento (erro):', redirectUrl.toString());
    console.error('═══════════════════════════════════════════════════════════════');
    
    const res = NextResponse.redirect(redirectUrl, 303);
    res.cookies.set('postpay', '1', {
      path: '/',
      maxAge: 10,
      sameSite: 'none',
      secure: true,
    });
    return res;
  }
}

// ROTA DE TESTE - Simulação de callback do SISP
export async function GET(request: NextRequest) {
  console.log('\n🧪 [TEST] SIMULAÇÃO DE CALLBACK PARA TESTES');
  
  const redirectUrl = new URL('/backoffice', request.url);
  redirectUrl.searchParams.set('menu', 'recibo');
  
  console.log('🧪 [TEST] URL de redirecionamento:', redirectUrl.toString());
  
  // Criar dados de teste
  const paymentResult = {
    serverStatus: 'error',
    serverMessage: 'Teste de callback simulado - Erro de validação',
    collectStatus: 'skipped',
    collectMessage: '',
    merchantRef: 'TEST123',
    amount: '1000',
    debugRef: 'REF_TEST_123',
    debugFp: 'FP_TEST_ABC...',
  };
  
  const res = NextResponse.redirect(redirectUrl, 303);
  
  res.cookies.set('payment_result', JSON.stringify(paymentResult), {
    path: '/',
    maxAge: 30,
    sameSite: 'lax',
    secure: true,
  });
  
  res.cookies.set('postpay', '1', {
    path: '/',
    maxAge: 10,
    sameSite: 'none',
    secure: true,
  });
  
  console.log('🍪 [TEST] Cookie payment_result criado:', paymentResult);
  
  return res;
}
