<h4>
    <span class="prop-name"><%= doc.shortName %></span>
    -
    <code style="color:#ffffff;filter:alpha(opacity=0);background:#000" class="prop-type"><%= doc.type == 'function' && doc.owner == 'hero' ? '方法' : doc.type %></code>
    <% if(doc.type != 'function') { %>
    (
    <% if(writable){ %>
    <span data-i18n="skill_docs.writable">可写</span>
    <% }else{ %>
    <span data-i18n="skill_docs.read_only">只读</span>
    <% } %>
    )
    <% } %>
</h4>
<div style="color:#00caff" class="description">
    <% if (doc.short_description) {%>
        <p> <%= marked(doc.short_description || '抱歉，暂无注释') %></p>
    <% } else{ %>
        <p> <%= marked(doc.description || '抱歉，暂无注释') %></p>
    <% } %>
</div>

<% if(!selectedMethod){ %>
<% if(doc.short_example){ %>
<p class="example">
    <strong>
        <span data-i18n="skill_docs.example">例子</span>
        :
    </strong>
    <div class="docs-ace-container">
        <div class="docs-ace"><%= doc.short_example %></div>
    </div>
</p>
<% } 
else if(doc.type == 'function' && argumentExamples.length){ %>
<p class="example">
    <strong>
        <span data-i18n="skill_docs.example">例子</span>
        :
    </strong>
    <div>
        <div class="docs-ace-container">
            <div class="docs-ace">
                <% if(language == 'javascript'){ %>
                <span class="spr"> <%= doc.owner + '.' + docName + '(' + argumentExamples.join(', ') + ');' %></span>
                <% }else if(language == 'coffeescript'){ %>
                <span class="spr"> <%= doc.ownerName + (doc.ownerName == '@' ? '' : '.') + docName + ' ' + argumentExamples.join(', ')%></span>
                <% }else if(language == 'python'){ %>
                <span class="spr"> <%= doc.ownerName + '.' + docName + '(' + argumentExamples.join(', ') + ')'%></span>
                <% }else if(language == 'clojure'){ %>
                <span class="spr"> <%= '(.' + docName + ' ' + doc.ownerName + ' ' + argumentExamples.join(', ') + ')'%></span>
                <% }else if(language == 'lua'){ %>
                <span class="spr"> <%= doc.ownerName + ':' + docName + '(' + argumentExamples.join(', ') + ')'%></span>
                <% }else if(language == 'io'){ %>
                <span class="spr"> <%= (doc.ownerName == 'this' ? '' : doc.ownerName + ' ') + docName + '(' + argumentExamples.join(', ') + ')'%></span>
                <% } %>
            </div>
        </div>
    </div>
</p>
<% } %>
<% } %>