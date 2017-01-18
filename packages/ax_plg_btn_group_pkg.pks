--------------------------------------------------------
--  DDL for Package AX_PLG_BTN_GROUP_PKG
--------------------------------------------------------

  CREATE OR REPLACE PACKAGE "AX_PLG_BTN_GROUP_PKG"
as


    function button_group(
            p_item                in apex_plugin.t_page_item,
            p_plugin              in apex_plugin.t_plugin,
            p_value               in varchar2,
            p_is_readonly         in boolean,
            p_is_printer_friendly in boolean)
        return apex_plugin.t_page_item_render_result;
end ax_plg_btn_group_pkg;

/
