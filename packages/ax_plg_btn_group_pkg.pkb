--------------------------------------------------------
--  DDL for Package Body AX_PLG_BTN_GROUP_PKG
--------------------------------------------------------

  CREATE OR REPLACE PACKAGE BODY "AX_PLG_BTN_GROUP_PKG"
as
    gv_playground_host varchar2(100) := 'PLAYGROUND';
    ----------------
    ---
    ---
    function f_is_playground
        return boolean
    is
        v_ax_workspace varchar2(200) ;
    begin
         select apex_util.find_workspace(
            (
                 select apex_application.get_security_group_id from dual
            )
            )
           into v_ax_workspace
           from dual;
        if gv_playground_host = v_ax_workspace then
            return true;
        else
            return false;
        end if;
    end f_is_playground;
    ----------------
    ---
    ---
    procedure res_out(
            p_clob clob)
    is
        v_char varchar2(32000) ;
        v_clob clob := p_clob;
    begin
        while length(v_clob) > 0
        loop
            begin
                if length(v_clob) > 32000 then
                    v_char       := substr(v_clob, 1, 32000) ;
                    sys.htp.prn(v_char) ;
                    v_clob := substr(v_clob, length(v_char) + 1) ;
                else
                    v_char := v_clob;
                    sys.htp.prn(v_char) ;
                    v_char := '';
                    v_clob := '';
                end if;
            end;
        end loop;
    end res_out;
    ----------------
    ---
    ---
    function button_group(
            p_item                in apex_plugin.t_page_item,
            p_plugin              in apex_plugin.t_plugin,
            p_value               in varchar2,
            p_is_readonly         in boolean,
            p_is_printer_friendly in boolean)
        return apex_plugin.t_page_item_render_result
    as
        --
        g_display_col  constant number(1) := 1;
        g_return_col   constant number(1) := 2;
        g_icon_col     constant number(1) := 3;
        --
        v_result       apex_plugin.t_page_item_render_result;
        v_name         varchar2(100) := apex_plugin.get_input_name_for_page_item(p_is_multi_value => false);
        v_exe_code     clob;
        v_config       clob;

        --
        v_min_cols    constant number(1) := 2; -- TODO from p_plugin
        v_max_cols    constant number(1) := 3; -- TODO from p_plugin
        v_lov         apex_plugin_util.t_column_value_list;
        v_icons_only  p_item.attribute_01%type := p_item.attribute_01;
        v_btn_vert    p_item.attribute_01%type := p_item.attribute_02;
    begin
       if f_is_playground = false then
            -- libs
            apex_javascript.add_library(p_name          => 'handlebars-v4.0.5',
                                       p_directory      =>  p_plugin.file_prefix,
                                       p_version        => NULL,
                                       p_skip_extension => FALSE);

            apex_javascript.add_library(p_name          => 'opentip',
                                       p_directory      =>  p_plugin.file_prefix,
                                       p_version        => NULL,
                                       p_skip_extension => FALSE);

            apex_javascript.add_library(p_name          => 'adapter-jquery',
                                       p_directory      =>  p_plugin.file_prefix,
                                       p_version        => NULL,
                                       p_skip_extension => FALSE);

            apex_css.add_file(p_name => 'opentip', p_directory =>
            p_plugin.file_prefix) ;

            apex_javascript.add_library(p_name => 'button.group', p_directory =>
            p_plugin.file_prefix, p_version => null, p_skip_extension => false) ;

            apex_css.add_file(p_name => 'button.group', p_directory =>
            p_plugin.file_prefix) ;
            -- end of libs
        end if;

        res_out('<input id="'|| p_item.name || '"' ||
                ' name="' || v_name || '"' ||
                ' type="hidden"></input>');

        -- During plug-in development it's very helpful to have some debug information
        if apex_application.g_debug then
            apex_plugin_util.debug_page_item(
                p_plugin                => p_plugin,
                p_page_item             => p_item,
                p_value                 => p_value,
                p_is_readonly           => p_is_readonly,
                p_is_printer_friendly   => p_is_printer_friendly
            );
        end if;

        apex_json.initialize_clob_output;
        apex_json.open_object;
        apex_json.open_array('data');

        if p_item.lov_definition is not null then
             v_lov := apex_plugin_util.get_data(
               p_sql_statement  => p_item.lov_definition,
               p_min_columns    => v_min_cols,
               p_max_columns    => v_max_cols,
               p_component_name => p_item.name
             );

             for i in 1 .. v_lov(g_display_col).count loop
                 apex_json.open_object;

                 apex_json.write('value', v_lov(g_display_col)(i));
                 apex_json.write('text' , v_lov(g_return_col)(i));

                 if v_lov.exists(g_icon_col) then
                    apex_json.write('icon' , v_lov(g_icon_col)(i));
                 end if;

                 apex_json.write('name' , lower(p_item.id));
                 apex_json.close_object;
             end loop;
        end if;

        apex_json.close_array;

        if v_icons_only = 'Y' then
            apex_json.write('showOnlyIcons', true);
        else
            apex_json.write('showOnlyIcons', false);
        end if;

        if p_item.element_css_classes is not null then
            apex_json.write('elementCssClasses', p_item.element_css_classes);
        end if;

        if p_item.element_attributes is not null then
            apex_json.write('elementAttributes', p_item.element_attributes);
        end if;

        if v_btn_vert = 'Y' then
            apex_json.write('verticalAlignBtn', true);
        else
            apex_json.write('verticalAlignBtn', false);
        end if;

        apex_json.close_object;

        v_config := apex_json.stringify(apex_json.get_clob_output);
        apex_json.free_output;

        v_exe_code := ' new apex.plugins.buttonGroup({'         ||
            'itemId         :"'  || p_item.name         || '",' ||
            'value          :"'  || p_value             || '",' ||
            'config         : '  || v_config            || ' '  ||
        ' });';

        apex_javascript.add_onload_code(p_code => v_exe_code) ;

        if apex_application.g_debug then
          apex_debug_message.message(p_message => 'JS Onload: ' || v_exe_code);
        end if;

        -- Tell APEX that this field is navigable',
        v_result.is_navigable := true;

        return v_result;
    end button_group;

end ax_plg_btn_group_pkg;

/
