local M = {}

local function extract_param_name(signature, parameter, active_parameter_index)
  if not parameter then
    return nil
  end

  local label = parameter.label
  if type(label) == "table" then
    local sig_label = signature and signature.label or ""
    local start_index = (label[1] or 0) + 1
    local end_index = label[2] or start_index
    label = sig_label:sub(start_index, end_index)
  end

  if type(label) ~= "string" then
    return nil
  end

  local name = label:match("([%a_][%w_]*)")
  return name
end

function M.update_from_signature(bufnr, result)
  if not bufnr or bufnr <= 0 then
    return
  end

  if not result or not result.signatures or vim.tbl_isempty(result.signatures) then
    vim.b[bufnr].lsp_active_parameter_name = nil
    return
  end

  local signature_index = (result.activeSignature or 0) + 1
  local signature = result.signatures[signature_index] or result.signatures[1]
  if not signature then
    vim.b[bufnr].lsp_active_parameter_name = nil
    return
  end

  local param_index = (result.activeParameter or signature.activeParameter or 0) + 1
  local parameters = signature.parameters or {}
  local parameter = parameters[param_index]
  local name = extract_param_name(signature, parameter, param_index)

  if name and #name > 0 then
    vim.b[bufnr].lsp_active_parameter_name = name
  else
    vim.b[bufnr].lsp_active_parameter_name = nil
  end
end

function M.clear(bufnr)
  if bufnr and bufnr > 0 then
    vim.b[bufnr].lsp_active_parameter_name = nil
  end
end

return M
