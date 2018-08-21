import Editor = AceAjax.Editor;
// import Range  = AceAjax.Range;

import SyntaxLoop from "./SyntaxCheckLoop";
import ProblemAlertView from "./ProblemAlertView";

import EquipInfo from "../model/vo/EquipInfo";
import ConfigManager from "../manager/ConfigManager";
import DataAccessEntry from "../model/DataAccessEntry";
import DataAccessManager from "../base/da/DataAccessManager";
import World from "../../src/view/battlescene/world/World";
import ActionItem from "../view/battleui/action/ActionItem";
/**
 * Created by Stanley on 2016/10/23.
 */
/// <reference path="../../typings/index.d.ts" />
declare var Zatanna;

var editModes =  {
    'javascript': 'ace/mode/javascript',
    'coffeescript': 'ace/mode/coffee',
    'python': 'ace/mode/python',
    'clojure': 'ace/mode/clojure',
    'lua': 'ace/mode/lua',
    'io': 'ace/mode/text'
};

export default class EditorAdapter extends egret.EventDispatcher
{
    public editor: Editor;
    public language:string;
    private aceDoc:any;
    public zatanna:any;
    public autocomplete:boolean;
    private aceCommands:any[];

    private syntaxLoop:SyntaxLoop;
    public problemShow:ProblemAlertView;

    private oldValue:string;
    private newValue:string;

    public init(language: string = "python"): void
    {
        this.language = language;
        this.editor = ace.edit('code-area');
        this.editor.on('focus', () => {
            this.dispatchEvent(new egret.Event('EditEvent', false, false, {type:'focus', data:true}));
        });
        
        this.editor.getSession().setTabSize(4);
        this.editor.setFontSize('14px');
        this.editor.getSession().setUseSoftTabs(true);

        this.editor.getSession().setMode('ace/mode/' + language);
        this.editor.setTheme('ace/theme/monokai');
        this.editor.renderer.adjustWrapLimit();
        this.editor.setAutoScrollEditorIntoView(true);
        this.editor.renderer.setAnimatedScroll(true);
        this.editor.setOption('highlightGutterLine', true);

        var aceSession = this.editor.getSession();
        this.aceDoc = aceSession.getDocument();
        aceSession.setUseWorker(false);

        aceSession.setMode(editModes[language]);

        aceSession.setWrapLimitRange(null, null);
        aceSession.setUseWrapMode(true);
        aceSession.setNewLineMode('windows');
        aceSession.setUseSoftTabs(true);
        
        this.editor.setShowPrintMargin(false);
        this.editor.setShowInvisibles(false);
        this.editor.setBehavioursEnabled(true);
        this.editor.setShowFoldWidgets(false);
        this.editor.setKeyboardHandler(null);

        this.editor.setHighlightActiveLine(true);
        this.editor.$blockScrolling = Infinity;

        this.createShortcuts();
        this.initAutoComplete( true, this.language );
        //语法检查 - 线程
        this.syntaxLoop = new SyntaxLoop(this, this.language);

        //错误展示 - html面板
        this.problemShow = new ProblemAlertView();

        var self = this;
        this.editor.commands['on']('exec', (e) => {
            e.stopPropagation();
            e.preventDefault();

            if(-1 != ['Enter', 'Return'].indexOf(e.command.name)  /*&& !e.editor.completer.popup.isOpen*/) {
                if(this.zatanna && this.zatanna.on) this.zatanna.on();
                return e.editor.execCommand('optimizeInsertMatch');
            }

            if(e.command && this.editor && 'updateTokensOnEnter' == e.command.name)
            {
                let cursor = this.editor.getCursorPosition();
                let cursorRow = cursor.row;
                if(cursorRow >= this.editor.getSession().getLength()-2) {
                    e['editor'].renderer.scrollToRow( e['editor'].renderer.getLastVisibleRow() );
                }
            }
            if(this.zatanna && this.zatanna.on) this.zatanna.on();
            e.command.exec(e.editor, e.args || {});
        });

        this.oldValue = "";
        this.newValue = this.editor.getValue();

        var self = this;
        this.editor.renderer['on']('afterRender', function() {
            self.oldValue = self.newValue;
            if(self.editor) self.newValue = self.editor.getValue();
            else {
                self.newValue || (self.newValue = "");
            }
            if(self.oldValue != self.newValue) {
                self.syntaxLoop.transpile( self.editor.getValue() );
            }
        });

        this.addEventListener(World.HERO_CLICKED, function(e) {
            console.log( e.data );
        }, this);
    };

    public initAutoComplete(autocomplete = true, language:string)
    {
        this.autocomplete = autocomplete;

        this.zatanna = new Zatanna(this.editor, {
            basic: true,
            liveCompletion: true,
            snippetsLangDefaults: false,
            completers: {
                keywords: false,
                snippets: autocomplete,
                text: autocomplete
            },
            autoLineEndings:{
                javascript: ';'
            },
            popupFontSizePx: 16,
            popupWidthPx: 380
        });

        this.addMaliSnippets(language);
    }

    private updateAutocomplete(autocomplete)
    {
        this.autocomplete = autocomplete;
        if(this.zatanna)
        {
            this.zatanna.set('snippets', autocomplete);
        }
    }

    public getValidCodeLines()
    {
        var docLines = this.editor.session.doc.getAllLines();
        var docLength= this.editor.session.doc.getLength();

        var commentReg = /^\s*(#|\/\/)/; //单行注释
        var multiLineStartReg = /^\s*(\/\*)/;
        var multiLineEndReg = /.*(\*\/)/;

        var isInMultiComment = false;
        var notValidLineNum = 0;
        for(let i = 0; i < docLength; ++ i)
        {
            let docLine = docLines[i];
            if(multiLineStartReg.test( docLine ))
            {
                isInMultiComment = true;
            }
            else if(multiLineEndReg.test( docLine ))
            {
                isInMultiComment = false;
                ++ notValidLineNum;
            }

            if(true == isInMultiComment)
            {
                ++ notValidLineNum;
            }
            else if(commentReg.test( docLine ) || /^$/.test( docLine ))
            {
                ++ notValidLineNum;
            }
        }
        return docLength - notValidLineNum;
    }

    private createShortcuts()
    {
        var addCommand = (command) => {
            this.editor.commands.addCommand(command);
        };

        addCommand({
            name: 'test',
            bindKey: 'F7',
            exec: () => {
                console.log( 'F7 pressed' );
                this.syntaxLoop.transpile();
            }
        });

        addCommand({
            name: 'optimizeInsertMatch',
            bindKey: 'Enter|Return',
            exec: () => {
                if(this.editor.getSession().selection.isEmpty())
                {
                    var cursor = this.editor.getCursorPosition();
                    var line   = this.aceDoc.getLine(cursor.row);
                    
                    var popup  = this.editor['completer'].popup;
                    var lineSlice = line.slice(0, cursor.column);

                    var lineData = lineSlice.split(/[^,]?\s*;\s*|[^,]?\s+/);
                    if(!popup.getData(popup.getRow()).snippet || lineData.length < 1 )
                    {
                        this.editor['completer'].insertMatch();
                    }
                    else
                    {
                        if( this.editor['completer'].popup.isOpen )
                        {
                            let snippetCode = popup.getData(popup.getRow()).snippet;
                            let bracketRight= lineSlice.lastIndexOf( ")" );
                            let heroRight   = lineSlice.lastIndexOf( "hero" );

                            if( (-1 != bracketRight && -1 != heroRight && bracketRight < heroRight) || (-1 == bracketRight && -1 != heroRight) )
                            {
                                let startColum = Math.max( cursor.column - lineData.slice(-1)[0].length, bracketRight );
                                let Range = ace.require('./range').Range;
                                var range = new Range(cursor.row,  startColum, cursor.row, cursor.column ); 
                                this.editor.getSession().remove( range );
                            }
                            this.editor['completer'].insertMatch();

                            let isLineWrap = false;
                            let skillConfig = ConfigManager.getInstance().getConfigs('skill');
                            var needLineWrap = [];
                            for(var skillId in skillConfig)
                            {
                                if( skillConfig[skillId]['islinebreak'] == '1' ) {
                                    needLineWrap.push( skillConfig[skillId]['snippet_' + this.language] );
                                }
                            }
                            if(-1 != needLineWrap.indexOf( snippetCode )) {
                                isLineWrap = true;
                                this.editor.insert('\n');
                            }   
                        }
                        else
                        {
                            this.editor.execCommand('insertstring', '\n');
                            this.editor.renderer.scrollCursorIntoView();
                            this.editor.renderer['animateScrolling'](this.editor.renderer['scrollTop']);
                        }
                    }

                }
            }
        });
    }
    
    /**
     * 添加与关卡,英雄技能相关的代码片段
     * @param {Array} snippets 一组snippet
     * @param {string} language
     * snippet: {
     *      content: 'hero.moveDown()',
     *      meta: 'press enter'.
     *      name: 'moveDown',
     *      tabTrigger: 'moveDown'
     * }
     */
    private addMaliSnippets( language:string )
    {
        let userInfo = DataAccessManager.getAccess(DataAccessEntry.USERINFO_PROXY).data;
        let ownEquipIds:number[] = userInfo.ownedHero.items, snippets = [];
        for(let itemId of ownEquipIds)
        {
            let equip:EquipInfo = userInfo.getEquipById(itemId);
            if(!equip || !equip.data.skill || equip.data.skill.length < 5) continue;

            let skillIds:string[] = equip.data.skill.split('|');
            for(let skillId of skillIds)
            {
                let skillData = ConfigManager.getInstance().getConfig('skill', parseInt(skillId));
                if(!skillData) continue;

                snippets.push({
                    content: skillData['snippet_' + language],
                    meta: 'press enter',
                    name: skillData['type'],
                    tabTrigger: skillData['tabtrigger']
                });
            }
        }
        snippets.push({
            content: "hero.say(${1:})",
            meta: 'press enter',
            name: 'say',
            tabTrigger: 'say'
        });
        this.zatanna.addSnippets(snippets, language);
    }

    /**
     * 显示编辑器
     */
    public show():void
    {
        document.getElementById('code-area').style.display = 'block';
    }

    /**
     * 隐藏编辑器
     */
    public hide():void
    {
        document.getElementById('code-area').style.display = 'none';
    }



    public dispose():void
    {
        this.hide();
        //终止线程
        this.syntaxLoop.terminate();
        //关闭错误提示界面
        ProblemAlertView.getInstance().hideProblems();
        
        this.editor.setValue('');
        this.editor = null;
    }
}